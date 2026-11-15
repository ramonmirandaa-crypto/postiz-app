import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SocialAnalyzerSite {
  url: string;
  detections?: Array<{
    return?: 'true' | 'false';
    string?: string;
    type?: string;
    name?: string;
  }>;
  type?: string;
  global_rank?: number;
  country?: string;
  nsfw?: string;
}

interface ScanBody {
  username?: string;
  websites?: string[];
  country?: string;
  type?: string;
  limit?: number;
}

interface AnalyzeBody {
  username?: string;
}

const sitesPath = join(
  process.cwd(),
  '../../libraries/nestjs-libraries/src/social-analyzer/sites.json'
);

const sites = JSON.parse(readFileSync(sitesPath, 'utf8'))
  .websites_entries as SocialAnalyzerSite[];

const normalizeUsername = (username?: string) => {
  const value = (username || '').trim();
  if (!value || value.length > 64) {
    throw new BadRequestException('Invalid username');
  }

  return value;
};

const clampLimit = (limit?: number) => {
  const parsed = Number(limit || 40);
  if (!Number.isFinite(parsed)) {
    return 40;
  }

  return Math.min(Math.max(Math.floor(parsed), 1), 120);
};

const siteName = (url: string) => {
  try {
    return new URL(url.replace('{username}', 'profile')).hostname.replace(
      /^www\./,
      ''
    );
  } catch {
    return url;
  }
};

const filteredSites = (body: ScanBody) => {
  const websiteFilters = (body.websites || [])
    .map((item) => item.toLowerCase().trim())
    .filter(Boolean);
  const country = body.country?.toLowerCase().trim();
  const type = body.type?.toLowerCase().trim();

  return sites
    .filter((site) => site.url?.includes('{username}'))
    .filter((site) => site.nsfw !== 'true')
    .filter((site) => {
      if (!websiteFilters.length) {
        return true;
      }

      const name = siteName(site.url).toLowerCase();
      return websiteFilters.some((filter) => name.includes(filter));
    })
    .filter((site) => {
      if (!country) {
        return true;
      }

      return (site.country || '').toLowerCase().includes(country);
    })
    .filter((site) => {
      if (!type) {
        return true;
      }

      return (site.type || '').toLowerCase().includes(type);
    })
    .sort((first, second) => {
      const firstRank = first.global_rank || Number.MAX_SAFE_INTEGER;
      const secondRank = second.global_rank || Number.MAX_SAFE_INTEGER;
      return firstRank - secondRank;
    })
    .slice(0, clampLimit(body.limit));
};

const fetchText = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 Postiz Social Analyzer (+https://postiz.com)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timeout);
  }
};

const scoreDetection = (
  site: SocialAnalyzerSite,
  username: string,
  text: string,
  status: number
) => {
  const detections = site.detections || [];
  let positive = 0;
  let negative = 0;

  for (const detection of detections) {
    if (!detection.string) {
      continue;
    }

    const needle = detection.string.split('{username}').join(username);
    const found = text.toLowerCase().includes(needle.toLowerCase());

    if (detection.return === 'true' && found) {
      positive += detection.type === 'advanced' ? 2 : 1;
    }

    if (detection.return === 'false' && found) {
      negative += detection.type === 'advanced' ? 2 : 1;
    }
  }

  if (!detections.some((detection) => detection.string) && status < 400) {
    positive += 1;
  }

  const rawScore = Math.max(0, positive - negative);
  const confidence = Math.min(100, Math.round((rawScore / 3) * 100));

  return {
    confidence,
    status:
      confidence >= 70 ? 'good' : confidence >= 35 ? 'maybe' : 'unknown',
    positive,
    negative,
  };
};

const extractTitle = (text: string) => {
  return (
    text.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
      ?.replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160) || ''
  );
};

const analyzeUsername = (username: string) => {
  const lower = username.toLowerCase();
  const numberMap: Record<string, string> = {
    '0': 'o',
    '1': 'l',
    '2': 'z',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '8': 'b',
  };
  const convertedNumbers = lower.replace(/[01234578]/g, (char) => {
    return numberMap[char] || char;
  });
  const words = Array.from(
    new Set(
      lower
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(/[^a-zA-Z0-9]+/)
        .filter((part) => part.length > 1)
    )
  );

  return {
    username,
    normalized: lower,
    convertedNumbers,
    numbers: lower.match(/\d+/g) || [],
    symbols: Array.from(new Set(lower.match(/[^a-zA-Z0-9]/g) || [])),
    words,
    candidates: Array.from(
      new Set([
        lower,
        convertedNumbers,
        lower.replace(/[^a-zA-Z0-9]/g, ''),
        lower.replace(/\d+/g, ''),
        ...words,
      ])
    ).filter((item) => item.length > 1),
  };
};

@ApiTags('Social Analyzer')
@Controller('/social-analyzer')
export class SocialAnalyzerController {
  @Get('/sites')
  async getSites(
    @Query('search') search?: string,
    @Query('country') country?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string
  ) {
    const body = {
      websites: search ? [search] : [],
      country,
      type,
      limit: Number(limit || 80),
    };

    return {
      sites: filteredSites(body).map((site) => ({
        name: siteName(site.url),
        url: site.url,
        type: site.type || 'Other',
        country: site.country || 'Global',
        rank: site.global_rank || null,
      })),
    };
  }

  @Post('/analyze')
  async analyze(@Body() body: AnalyzeBody) {
    return analyzeUsername(normalizeUsername(body.username));
  }

  @Post('/scan')
  async scan(@Body() body: ScanBody) {
    const username = normalizeUsername(body.username);
    const selectedSites = filteredSites(body);
    const analysis = analyzeUsername(username);
    const results = [];

    for (const site of selectedSites) {
      const link = site.url.replace('{username}', encodeURIComponent(username));

      try {
        const { response, text } = await fetchText(link);
        const score = scoreDetection(site, username, text, response.status);

        results.push({
          name: siteName(site.url),
          link,
          httpStatus: response.status,
          title: extractTitle(text),
          type: site.type || 'Other',
          country: site.country || 'Global',
          rank: site.global_rank || null,
          ...score,
        });
      } catch (error) {
        results.push({
          name: siteName(site.url),
          link,
          status: 'failed',
          confidence: 0,
          type: site.type || 'Other',
          country: site.country || 'Global',
          rank: site.global_rank || null,
        });
      }
    }

    return {
      username,
      analysis,
      scanned: selectedSites.length,
      results: results.sort((first, second) => {
        return second.confidence - first.confidence;
      }),
    };
  }
}
