'use client';

import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { Button } from '@gitroom/react/form/button';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';

interface AnalyzerResult {
  name: string;
  link: string;
  status: 'good' | 'maybe' | 'unknown' | 'failed';
  confidence: number;
  httpStatus?: number;
  title?: string;
  type: string;
  country: string;
  rank: number | null;
  positive?: number;
  negative?: number;
}

interface AnalyzerResponse {
  username: string;
  scanned: number;
  analysis: {
    normalized: string;
    convertedNumbers: string;
    numbers: string[];
    symbols: string[];
    words: string[];
    candidates: string[];
  };
  results: AnalyzerResult[];
}

const statusStyle = {
  good: 'bg-[#0f5132] text-[#d1fae5]',
  maybe: 'bg-[#7a4f01] text-[#fef3c7]',
  unknown: 'bg-newTableHeader text-newTableText',
  failed: 'bg-[#4b1d1d] text-[#fecaca]',
};

export const SocialAnalyzerComponent = () => {
  const fetch = useFetch();
  const [username, setUsername] = useState('');
  const [websites, setWebsites] = useState('');
  const [limit, setLimit] = useState(40);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<AnalyzerResponse | null>(null);

  const summary = useMemo(() => {
    if (!data) {
      return null;
    }

    const good = data.results.filter((item) => item.status === 'good').length;
    const maybe = data.results.filter((item) => item.status === 'maybe').length;
    const failed = data.results.filter((item) => item.status === 'failed').length;

    return { good, maybe, failed };
  }, [data]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/social-analyzer/scan', {
        method: 'POST',
        body: JSON.stringify({
          username,
          limit,
          websites: websites
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error('Scan failed');
      }

      setData(await response.json());
    } catch (err) {
      setError('Could not complete the scan. Check the username and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-[18px] bg-newBgColorInner p-[20px] overflow-auto">
      <div className="flex flex-wrap items-end justify-between gap-[16px]">
        <div>
          <h1 className="text-[24px] leading-[32px] font-semibold text-textColor">
            Social Analyzer
          </h1>
          <p className="text-[14px] leading-[20px] text-newTableText mt-[4px] max-w-[760px]">
            Find public profile matches and username signals using the
            social-analyzer detection database inside Postiz.
          </p>
        </div>
        {summary && (
          <div className="grid grid-cols-3 gap-[8px] min-w-[280px]">
            <Metric label="Good" value={summary.good} />
            <Metric label="Maybe" value={summary.maybe} />
            <Metric label="Failed" value={summary.failed} />
          </div>
        )}
      </div>

      <form
        onSubmit={submit}
        className="grid grid-cols-1 xl:grid-cols-[minmax(220px,1fr)_minmax(260px,1.2fr)_120px_auto] gap-[12px] items-end bg-newTableHeader border border-newTableBorder p-[16px]"
      >
        <Field label="Username">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="brand, creator, handle"
            className="w-full h-[40px] bg-newBgColorInner border border-newTableBorder px-[12px] text-[14px] outline-none"
            maxLength={64}
            required
          />
        </Field>

        <Field label="Platforms">
          <input
            value={websites}
            onChange={(event) => setWebsites(event.target.value)}
            placeholder="instagram, tiktok, youtube"
            className="w-full h-[40px] bg-newBgColorInner border border-newTableBorder px-[12px] text-[14px] outline-none"
          />
        </Field>

        <Field label="Limit">
          <input
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            type="number"
            min={1}
            max={120}
            className="w-full h-[40px] bg-newBgColorInner border border-newTableBorder px-[12px] text-[14px] outline-none"
          />
        </Field>

        <Button loading={loading} type="submit" className="min-w-[132px]">
          Scan
        </Button>
      </form>

      {error && (
        <div className="bg-[#4b1d1d] text-[#fecaca] border border-[#7f1d1d] px-[14px] py-[10px] text-[14px]">
          {error}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 2xl:grid-cols-[340px_1fr] gap-[16px]">
          <div className="bg-newTableHeader border border-newTableBorder p-[16px] flex flex-col gap-[14px]">
            <h2 className="text-[18px] font-medium text-textColor">
              Username analysis
            </h2>
            <AnalyzerRow label="Normalized" value={data.analysis.normalized} />
            <AnalyzerRow
              label="Number conversion"
              value={data.analysis.convertedNumbers}
            />
            <TagGroup label="Candidates" values={data.analysis.candidates} />
            <TagGroup label="Words" values={data.analysis.words} />
            <TagGroup label="Numbers" values={data.analysis.numbers} />
            <TagGroup label="Symbols" values={data.analysis.symbols} />
          </div>

          <div className="bg-newTableHeader border border-newTableBorder overflow-hidden">
            <div className="grid grid-cols-[1.2fr_90px_90px_1fr_110px] gap-[12px] px-[14px] py-[10px] text-[12px] uppercase text-newTableText border-b border-newTableBorder">
              <div>Platform</div>
              <div>Status</div>
              <div>Score</div>
              <div>Title</div>
              <div>HTTP</div>
            </div>
            <div className="divide-y divide-newTableBorder">
              {data.results.map((item) => (
                <a
                  key={item.link}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="grid grid-cols-[1.2fr_90px_90px_1fr_110px] gap-[12px] px-[14px] py-[12px] text-[14px] hover:bg-newBgColorInner transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-textColor truncate">
                      {item.name}
                    </div>
                    <div className="text-[12px] text-newTableText truncate">
                      {item.type}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-flex px-[8px] py-[4px] text-[12px] ${statusStyle[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-textColor">{item.confidence}%</div>
                  <div className="text-newTableText truncate">
                    {item.title || item.country || '-'}
                  </div>
                  <div className="text-newTableText">
                    {item.httpStatus || '-'}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = (props: { label: string; children: ReactNode }) => {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[13px] text-newTableText">{props.label}</span>
      {props.children}
    </label>
  );
};

const Metric = (props: { label: string; value: number }) => {
  return (
    <div className="bg-newTableHeader border border-newTableBorder px-[12px] py-[8px]">
      <div className="text-[12px] text-newTableText">{props.label}</div>
      <div className="text-[22px] leading-[26px] font-semibold text-textColor">
        {props.value}
      </div>
    </div>
  );
};

const AnalyzerRow = (props: { label: string; value: string }) => {
  return (
    <div>
      <div className="text-[12px] uppercase text-newTableText">
        {props.label}
      </div>
      <div className="text-[15px] text-textColor break-all">{props.value}</div>
    </div>
  );
};

const TagGroup = (props: { label: string; values: string[] }) => {
  return (
    <div>
      <div className="text-[12px] uppercase text-newTableText mb-[8px]">
        {props.label}
      </div>
      <div className="flex flex-wrap gap-[6px]">
        {props.values.length ? (
          props.values.map((value) => (
            <span
              key={value}
              className="bg-newBgColorInner border border-newTableBorder px-[8px] py-[4px] text-[12px] text-textColor"
            >
              {value}
            </span>
          ))
        ) : (
          <span className="text-[13px] text-newTableText">None</span>
        )}
      </div>
    </div>
  );
};
