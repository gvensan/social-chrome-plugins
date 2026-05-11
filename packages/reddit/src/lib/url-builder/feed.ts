import {
  buildQuery,
  sanitizeSubName,
  sanitizeUsername,
} from './encode';
import type { FeedInput, FeedTarget, ListingSort } from './types';

const ROOT = 'https://www.reddit.com';

// `sort=top` and `sort=controversial` honor `t=`. Other sorts ignore
// it; we omit `t=` in those cases for cleaner URLs.
const sortAcceptsTime = (sort: ListingSort | undefined): boolean =>
  sort === 'top' || sort === 'controversial';

const subredditsPath = (names: string[]): string | undefined => {
  const cleaned = names
    .map((n) => sanitizeSubName(n))
    .filter((n) => n.length > 0);
  if (cleaned.length === 0) return undefined;
  return cleaned.join('+');
};

const targetPath = (target: FeedTarget): string | undefined => {
  switch (target.kind) {
    case 'subreddits': {
      const path = subredditsPath(target.names);
      return path ? `/r/${path}` : undefined;
    }
    case 'global':
      return `/r/${target.scope}`;
    case 'user': {
      const u = sanitizeUsername(target.username);
      if (!u) return undefined;
      return `/user/${u}/${target.tab}`;
    }
  }
};

export const buildFeedUrl = (input: FeedInput = {}): string => {
  // No target → fall back to the front page so the URL is at least valid.
  if (!input.target) return ROOT + '/';

  const path = targetPath(input.target);
  if (!path) return ROOT + '/';

  const sort: ListingSort = input.sort ?? 'hot';
  const time = sortAcceptsTime(sort) ? input.time : undefined;

  if (input.target.kind === 'user') {
    // User pages take sort/t as query params, not path segments —
    // /user/<u>/submitted/?sort=top&t=year
    const pairs: Array<readonly [string, string | undefined]> = [
      ['sort', sort],
      ['t', time],
      ['geo_filter', input.geoFilter],
    ];
    return ROOT + path + '/' + buildQuery(pairs);
  }

  // Subreddit / multireddit / global feeds put sort in the path —
  // /r/<sub>/top/?t=week
  const pairs: Array<readonly [string, string | undefined]> = [
    ['t', time],
    ['geo_filter', input.geoFilter],
  ];
  return ROOT + path + `/${sort}/` + buildQuery(pairs);
};
