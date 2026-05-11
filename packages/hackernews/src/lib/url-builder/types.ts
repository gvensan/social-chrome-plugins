// HN Algolia search exposes a single URL surface — `hn.algolia.com/?...`
// — but the type axis covers six discrete content kinds, so this is
// effectively six "verticals" stacked into one parameter.
export type HNType =
  | 'all'
  | 'story'
  | 'comment'
  | 'ask_hn'
  | 'show_hn'
  | 'poll'
  | 'job';

export type HNSort = 'byPopularity' | 'byDate';

// Algolia's preset date windows. Custom ranges (epoch start/end) are
// supported via dateStart/dateEnd when dateRange === 'custom'.
export type HNDateRange =
  | 'all'
  | 'last24h'
  | 'pastWeek'
  | 'pastMonth'
  | 'pastYear'
  | 'custom';

export interface HNSearchInput {
  /** Free-text query; mapped to `?query=`. */
  keywords?: string;
  /** Result type (story, comment, ask_hn, etc.). */
  type?: HNType;
  /** Sort axis. byPopularity is HN's default discovery surface. */
  sort?: HNSort;
  /** Preset date window. `custom` activates dateStart/dateEnd. */
  dateRange?: HNDateRange;
  /** Custom-range start (epoch seconds). Only used when dateRange='custom'. */
  dateStart?: number;
  /** Custom-range end (epoch seconds). Only used when dateRange='custom'. */
  dateEnd?: number;
  /** Limit results to a HN author. Strips a leading @. */
  author?: string;
  /** Limit results to comments under a specific story id. */
  storyId?: string;
  /** Minimum points (numeric filter). Algolia's `points>=N`. */
  minPoints?: number;
  /** Minimum comment count (numeric filter). Algolia's `num_comments>=N`. */
  minComments?: number;
  /** Disable prefix matching. Default true; set false for stricter match. */
  prefix?: boolean;
}

export type SearchInput =
  | { type: 'search'; input: HNSearchInput }
  | { type: 'special'; url: string };

export const emptySearch = (): SearchInput => ({
  type: 'search',
  input: {},
});
