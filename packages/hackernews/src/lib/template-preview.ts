import type { HNSearchInput, SearchInput } from './url-builder/types';

const TYPE_LABEL: Record<string, string> = {
  all: 'all',
  story: 'stories',
  comment: 'comments',
  ask_hn: 'ask_hn',
  show_hn: 'show_hn',
  poll: 'polls',
  job: 'jobs',
};

const summarizeSearchInput = (i: HNSearchInput): string => {
  const bits: string[] = [];
  if (i.type) bits.push(`type:${TYPE_LABEL[i.type] ?? i.type}`);
  if (i.keywords?.trim()) bits.push(`query: "${i.keywords.trim()}"`);
  if (i.author) bits.push(`author:${i.author}`);
  if (i.storyId) bits.push(`story:${i.storyId}`);
  if (i.dateRange && i.dateRange !== 'all') bits.push(`when:${i.dateRange}`);
  if (typeof i.minPoints === 'number' && i.minPoints > 0)
    bits.push(`points>=${i.minPoints}`);
  if (typeof i.minComments === 'number' && i.minComments > 0)
    bits.push(`comments>=${i.minComments}`);
  if (i.sort) bits.push(`sort:${i.sort}`);
  if (i.prefix === false) bits.push('exact match');
  return bits.length > 0 ? bits.join(' · ') : 'all defaults';
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
