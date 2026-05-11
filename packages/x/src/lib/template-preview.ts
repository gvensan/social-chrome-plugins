import type { SearchInput, XSearchInput } from './url-builder';

const MODE_LABEL: Record<string, string> = {
  top: 'Top',
  latest: 'Latest',
  people: 'People',
  media: 'Media',
};

const summarizeSearchInput = (i: XSearchInput): string => {
  const bits: string[] = [`mode: ${MODE_LABEL[i.mode] ?? i.mode}`];
  if (i.keywords?.trim()) bits.push(`keywords: "${i.keywords.trim()}"`);
  if (i.fromUser) bits.push(`from:${i.fromUser}`);
  if (i.toUser) bits.push(`to:${i.toUser}`);
  if (i.mentioning) bits.push(`@${i.mentioning}`);
  if (i.hashtag) bits.push(`#${i.hashtag}`);
  if (i.since) bits.push(`since:${i.since}`);
  if (i.until) bits.push(`until:${i.until}`);
  if (typeof i.minFaves === 'number' && i.minFaves > 0)
    bits.push(`min_faves:${i.minFaves}`);
  if (typeof i.minRetweets === 'number' && i.minRetweets > 0)
    bits.push(`min_retweets:${i.minRetweets}`);
  if (typeof i.minReplies === 'number' && i.minReplies > 0)
    bits.push(`min_replies:${i.minReplies}`);
  if (i.language) bits.push(`lang:${i.language}`);
  if (i.list) bits.push(`list:${i.list}`);
  if (i.filterReplies === 'only') bits.push('replies only');
  if (i.filterReplies === 'exclude') bits.push('no replies');
  if (i.filterMedia && i.filterMedia !== 'any')
    bits.push(`filter:${i.filterMedia}`);
  if (i.verifiedOnly) bits.push('verified only');
  if (i.excludeRetweets) bits.push('no retweets');
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
