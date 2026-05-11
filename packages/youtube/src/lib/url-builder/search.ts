import { encodeValue, tokenForPreset } from './encode';
import type { YouTubeSearchInput } from './types';

const BASE = 'https://www.youtube.com/results';

export const buildSearchUrl = (input: YouTubeSearchInput): string => {
  const parts: string[] = [];
  const kw = input.keywords?.trim();
  if (kw) parts.push(`search_query=${encodeValue(kw)}`);
  const sp = tokenForPreset(input.preset);
  if (sp) parts.push(`sp=${sp}`);
  return parts.length === 0 ? BASE : `${BASE}?${parts.join('&')}`;
};
