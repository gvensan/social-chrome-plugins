import type { MediaFilter, ReplyFilter, XSearchMode } from './types';

export const encodeValue = (v: string): string => encodeURIComponent(v);

export const buildQuery = (
  pairs: ReadonlyArray<readonly [string, string | undefined]>
): string => {
  const parts: string[] = [];
  for (const [k, v] of pairs) {
    if (v === undefined || v === '') continue;
    parts.push(`${k}=${v}`);
  }
  return parts.length === 0 ? '' : '?' + parts.join('&');
};

const stripLeading = (v: string, ch: string): string =>
  v.startsWith(ch) ? v.slice(1) : v;

const trim = (v: string | undefined): string | undefined => {
  if (!v) return undefined;
  const t = v.trim();
  return t === '' ? undefined : t;
};

// Operator formatters. Each returns either a non-empty operator string
// or undefined when the input is missing/blank.

export const opFromUser = (v: string | undefined): string | undefined => {
  const t = trim(v);
  return t ? `from:${stripLeading(t, '@')}` : undefined;
};

export const opToUser = (v: string | undefined): string | undefined => {
  const t = trim(v);
  return t ? `to:${stripLeading(t, '@')}` : undefined;
};

export const opMentioning = (v: string | undefined): string | undefined => {
  const t = trim(v);
  return t ? `@${stripLeading(t, '@')}` : undefined;
};

export const opHashtag = (v: string | undefined): string | undefined => {
  const t = trim(v);
  return t ? `#${stripLeading(t, '#')}` : undefined;
};

export const opSince = (v: string | undefined): string | undefined => {
  const t = trim(v);
  return t ? `since:${t}` : undefined;
};

export const opUntil = (v: string | undefined): string | undefined => {
  const t = trim(v);
  return t ? `until:${t}` : undefined;
};

export const opMinFaves = (v: number | undefined): string | undefined =>
  typeof v === 'number' && v > 0 ? `min_faves:${v}` : undefined;

export const opMinRetweets = (v: number | undefined): string | undefined =>
  typeof v === 'number' && v > 0 ? `min_retweets:${v}` : undefined;

export const opMinReplies = (v: number | undefined): string | undefined =>
  typeof v === 'number' && v > 0 ? `min_replies:${v}` : undefined;

export const opLang = (v: string | undefined): string | undefined => {
  const t = trim(v);
  return t ? `lang:${t}` : undefined;
};

export const opList = (v: string | undefined): string | undefined => {
  const t = trim(v);
  return t ? `list:${t}` : undefined;
};

export const opReplies = (v: ReplyFilter | undefined): string | undefined => {
  if (!v || v === 'include') return undefined;
  if (v === 'only') return 'filter:replies';
  return '-filter:replies';
};

export const opMedia = (v: MediaFilter | undefined): string | undefined => {
  if (!v || v === 'any') return undefined;
  if (v === 'images') return 'filter:images';
  if (v === 'videos') return 'filter:videos';
  return 'filter:links';
};

export const opVerified = (v: boolean | undefined): string | undefined =>
  v ? 'filter:verified' : undefined;

export const opExcludeRetweets = (
  v: boolean | undefined
): string | undefined => (v ? '-filter:retweets' : undefined);

const MODE_FILTER: Record<XSearchMode, string | undefined> = {
  top: undefined,
  latest: 'live',
  people: 'user',
  media: 'image',
};

export const filterForMode = (mode: XSearchMode): string | undefined =>
  MODE_FILTER[mode];
