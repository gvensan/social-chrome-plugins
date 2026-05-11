import { PRESET_OPTIONS } from './params';
import type { SearchInput, YouTubeSearchInput } from './url-builder';

const presetLabel = (p: YouTubeSearchInput['preset']): string =>
  PRESET_OPTIONS.find((o) => o.value === p)?.label ?? String(p ?? '');

const summarizeSearchInput = (i: YouTubeSearchInput): string => {
  const bits: string[] = [];
  if (i.keywords?.trim()) bits.push(`keywords: "${i.keywords.trim()}"`);
  if (i.preset && i.preset !== 'none') {
    bits.push(`filter: ${presetLabel(i.preset)}`);
  }
  return bits.join(' · ');
};

export const summarizeSearch = (s: SearchInput): string => {
  switch (s.type) {
    case 'search':
      return summarizeSearchInput(s.input);
    case 'special':
      try {
        const u = new URL(s.url);
        return `direct: ${u.hostname}${u.pathname}${u.search}`;
      } catch {
        return `direct: ${s.url}`;
      }
  }
};
