import type {
  CommentSort,
  EntitySort,
  ListingSort,
  PostSort,
  TimeWindow,
} from './url-builder/types';

export interface Option<T> {
  value: T;
  label: string;
}

export const POST_SORT_OPTIONS: ReadonlyArray<Option<PostSort>> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'hot', label: 'Hot' },
  { value: 'top', label: 'Top' },
  { value: 'new', label: 'New' },
  { value: 'comments', label: 'Most comments' },
];

export const COMMENT_SORT_OPTIONS: ReadonlyArray<Option<CommentSort>> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'hot', label: 'Hot' },
  { value: 'top', label: 'Top' },
  { value: 'new', label: 'New' },
];

export const ENTITY_SORT_OPTIONS: ReadonlyArray<Option<EntitySort>> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'activity', label: 'Activity' },
];

export const LISTING_SORT_OPTIONS: ReadonlyArray<Option<ListingSort>> = [
  { value: 'hot', label: 'Hot' },
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top' },
  { value: 'rising', label: 'Rising' },
  { value: 'controversial', label: 'Controversial' },
];

export const TIME_OPTIONS: ReadonlyArray<Option<TimeWindow>> = [
  { value: 'hour', label: 'Past hour' },
  { value: 'day', label: 'Past 24 hours' },
  { value: 'week', label: 'Past week' },
  { value: 'month', label: 'Past month' },
  { value: 'year', label: 'Past year' },
  { value: 'all', label: 'All time' },
];

export const SELF_TYPE_OPTIONS: ReadonlyArray<Option<'self' | 'link'>> = [
  { value: 'self', label: 'Self-posts only' },
  { value: 'link', label: 'Link posts only' },
];

// Feed target sub-modes — used by the Feed builder form to pick between
// subreddit/multireddit, global feed, and user listings.
export type FeedTargetKind = 'subreddits' | 'global' | 'user';
export const FEED_TARGET_OPTIONS: ReadonlyArray<{
  id: FeedTargetKind;
  label: string;
}> = [
  { id: 'subreddits', label: 'Subreddit(s)' },
  { id: 'global', label: 'All / Popular' },
  { id: 'user', label: 'User' },
];

export const GLOBAL_SCOPE_OPTIONS: ReadonlyArray<Option<'all' | 'popular'>> = [
  { value: 'all', label: 'r/all' },
  { value: 'popular', label: 'r/popular' },
];

export const USER_TAB_OPTIONS: ReadonlyArray<
  Option<'submitted' | 'comments'>
> = [
  { value: 'submitted', label: 'Submissions' },
  { value: 'comments', label: 'Comments' },
];
