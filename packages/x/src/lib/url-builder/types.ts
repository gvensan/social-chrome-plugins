export type XSearchMode = 'top' | 'latest' | 'people' | 'media';

export type ReplyFilter = 'include' | 'only' | 'exclude';
export type MediaFilter = 'any' | 'images' | 'videos' | 'links';

export interface XSearchInput {
  keywords?: string;
  fromUser?: string;
  toUser?: string;
  mentioning?: string;
  hashtag?: string;
  since?: string;
  until?: string;
  minFaves?: number;
  minRetweets?: number;
  minReplies?: number;
  language?: string;
  list?: string;
  filterReplies?: ReplyFilter;
  filterMedia?: MediaFilter;
  verifiedOnly?: boolean;
  /** Exclude retweets/reposts. Emits `-filter:retweets`. */
  excludeRetweets?: boolean;
  mode: XSearchMode;
}

export type SearchInput =
  | { type: 'search'; input: XSearchInput }
  | { type: 'special'; url: string };

export const emptySearch = (mode: XSearchMode = 'top'): SearchInput => ({
  type: 'search',
  input: { mode },
});
