// Reddit search verticals — each maps to a different URL shape.
// Posts/Comments/Subreddits/Users all live under /search/?type=...,
// while Feed listings live under /r/<sub-or-multi>/<sort>/?t=... or
// /user/<u>/<tab>/?sort=...&t=... (a fundamentally different base).
export type RedditSearchType =
  | 'posts'
  | 'comments'
  | 'subreddits'
  | 'users'
  | 'feed';

// Sort axis varies by vertical because Reddit's search backend exposes
// a different set per type.
export type PostSort = 'relevance' | 'hot' | 'top' | 'new' | 'comments';
export type CommentSort = 'relevance' | 'hot' | 'top' | 'new';
export type EntitySort = 'relevance' | 'activity';
export type ListingSort = 'hot' | 'new' | 'top' | 'rising' | 'controversial';

// Time window for sort=top/comments/controversial (and Reddit search).
// Ignored for sort=hot/new/rising/relevance — Reddit just drops it.
export type TimeWindow = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';

// Posts search — Reddit Lucene-style operators get composed into the
// `q` field, with `type=link` set on the URL. Each operator gets its
// own typed input rather than asking the user to remember the syntax.
export interface PostsInput {
  keywords?: string;
  /** subreddit:<name> qualifier. Strips a leading `r/` if present. */
  subreddit?: string;
  /** author:<name> qualifier. Strips a leading `u/` or `/u/`. */
  author?: string;
  /** flair:<text> qualifier. Quoted automatically when it contains spaces. */
  flair?: string;
  /** title:<text> qualifier — restricts the match to the post title. */
  title?: string;
  /** selftext:<text> qualifier — restricts the match to the post body. */
  selftext?: string;
  /** self:yes or self:no. `undefined` means no filter. */
  selfType?: 'self' | 'link';
  /** url:<text> — substring match on the post's destination URL. */
  url?: string;
  /** site:<domain> — posts whose link targets a specific domain. */
  site?: string;
  /** Whether to surface NSFW posts (adds &include_over_18=on). */
  includeOver18?: boolean;
  sort?: PostSort;
  time?: TimeWindow;
}

export interface CommentsInput {
  keywords?: string;
  subreddit?: string;
  author?: string;
  includeOver18?: boolean;
  sort?: CommentSort;
  time?: TimeWindow;
}

export interface SubredditsInput {
  keywords?: string;
  includeOver18?: boolean;
  sort?: EntitySort;
}

export interface UsersInput {
  keywords?: string;
  sort?: EntitySort;
}

// Feed listing — Reddit lets you compose URLs like
//   /r/programming/top/?t=week                — single sub
//   /r/rust+golang+python/hot/                — multireddit
//   /r/all/top/?t=day                         — global "all"
//   /r/popular/hot/                           — popular feed
//   /user/<u>/submitted/?sort=top&t=year      — user's submissions
//   /user/<u>/comments/?sort=new              — user's comments
// All four shapes share sort + time, but the path differs. We model
// the target as a tagged union so the builder can pick the right shape
// without ambiguous fields.
export type FeedTarget =
  | { kind: 'subreddits'; names: string[] }
  | { kind: 'global'; scope: 'all' | 'popular' }
  | { kind: 'user'; username: string; tab: 'submitted' | 'comments' };

export interface FeedInput {
  target?: FeedTarget;
  sort?: ListingSort;
  time?: TimeWindow;
  /** Geo restriction — `geo_filter=US` etc. Undocumented; works for some sorts. */
  geoFilter?: string;
}

export type SearchInput =
  | { type: 'posts'; input: PostsInput }
  | { type: 'comments'; input: CommentsInput }
  | { type: 'subreddits'; input: SubredditsInput }
  | { type: 'users'; input: UsersInput }
  | { type: 'feed'; input: FeedInput }
  | { type: 'special'; url: string };

export const emptyInputFor = (type: RedditSearchType): SearchInput => {
  switch (type) {
    case 'posts':
      return { type: 'posts', input: {} };
    case 'comments':
      return { type: 'comments', input: {} };
    case 'subreddits':
      return { type: 'subreddits', input: {} };
    case 'users':
      return { type: 'users', input: {} };
    case 'feed':
      return { type: 'feed', input: {} };
  }
};
