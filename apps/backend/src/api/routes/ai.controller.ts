import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { DeepResearchService } from '@gitroom/nestjs-libraries/agent/deep-research.service';
import { ImageGenerationService } from '@gitroom/nestjs-libraries/agent/image-generation.service';
import { TrendingService } from '@gitroom/nestjs-libraries/agent/trending.service';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { CheckPolicies } from '@gitroom/backend/services/auth/permissions/permissions.ability';
import { AuthorizationActions, Sections } from '@gitroom/backend/services/auth/permissions/permission.exception.class';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';

export class ResearchDto {
  query: string;
  focus?: string;
}

export class CompetitorAnalysisDto {
  competitors: string[];
  niche: string;
}

export class ContentIdeasDto {
  topic: string;
  category: string;
  count?: number;
}

export class TrendingDto {
  niche: string;
  count?: number;
}

export class TrendReportDto {
  niche: string;
  platforms?: string[];
}

export class GenerateImageDto {
  prompt: string;
  style?: string;
  size?: '1024x1024' | '1024x1792' | '1792x1024';
}

export class EnhancePromptDto {
  content: string;
  platform?: string;
}

@Controller('/ai')
export class AIController {
  constructor(
    private _deepResearchService: DeepResearchService,
    private _imageGenerationService: ImageGenerationService,
    private _trendingService: TrendingService,
    private _mediaService: MediaService,
  ) {}

  @Post('/research')
  @CheckPolicies([AuthorizationActions.Create, Sections.AI])
  async conductResearch(@Body() dto: ResearchDto) {
    return this._deepResearchService.conductResearch(dto.query, dto.focus);
  }

  @Post('/competitor-analysis')
  @CheckPolicies([AuthorizationActions.Create, Sections.AI])
  async analyzeCompetitors(@Body() dto: CompetitorAnalysisDto) {
    return this._deepResearchService.analyzeCompetitors(dto.competitors, dto.niche);
  }

  @Post('/content-ideas')
  @CheckPolicies([AuthorizationActions.Create, Sections.AI])
  async generateContentIdeas(@Body() dto: ContentIdeasDto) {
    return this._deepResearchService.generateContentIdeas(
      dto.topic,
      dto.category,
      dto.count || 5
    );
  }

  @Get('/trending-topics')
  @CheckPolicies([AuthorizationActions.Create, Sections.AI])
  async getTrendingTopics(
    @Query('niche') niche: string,
    @Query('count') count?: number
  ) {
    return this._trendingService.getTrendingTopics(niche, count || 10);
  }

  @Post('/trend-report')
  @CheckPolicies([AuthorizationActions.Create, Sections.AI])
  async generateTrendReport(@Body() dto: TrendReportDto) {
    return this._trendingService.generateTrendReport(dto.niche, dto.platforms);
  }

  @Post('/suggest-ideas')
  @CheckPolicies([AuthorizationActions.Create, Sections.AI])
  async suggestContentIdeas(@Body() body: { topic: any; count?: number }) {
    return this._trendingService.suggestContentIdeas(body.topic, body.count || 5);
  }

  @Post('/generate-image')
  @CheckPolicies([AuthorizationActions.Create, Sections.AI])
  async generateImage(@Body() dto: GenerateImageDto) {
    return this._imageGenerationService.generateImage(dto.prompt, dto.style, dto.size);
  }

  @Post('/enhance-prompt')
  @CheckPolicies([AuthorizationActions.Create, Sections.AI])
  async enhancePrompt(@Body() dto: EnhancePromptDto) {
    return {
      originalPrompt: dto.content,
      enhancedPrompt: await this._imageGenerationService.enhancePrompt(dto.content, dto.platform)
    };
  }

  @Post('/generate-and-upload')
  @CheckPolicies([AuthorizationActions.Create, Sections.AI])
  async generateAndUpload(
    @Body() dto: GenerateImageDto,
    @GetOrgFromRequest() organization: Organization
  ) {
    const mediaId = await this._imageGenerationService.generateAndUpload(
      dto.prompt,
      organization.id,
      dto.style
    );
    return { mediaId };
  }

  @Get('/image-styles')
  @CheckPolicies([AuthorizationActions.Create, Sections.AI])
  async getImageStyles() {
    return this._imageGenerationService.getAvailableStyles();
  }
}