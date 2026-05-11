import { buildPostsUrl } from './posts';
import { buildCommentsUrl } from './comments';
import { buildSubredditsUrl } from './subreddits';
import { buildUsersUrl } from './users';
import { buildFeedUrl } from './feed';
import type { SearchInput } from './types';

export const buildUrl = (search: SearchInput): string => {
  switch (search.type) {
    case 'posts':
      return buildPostsUrl(search.input);
    case 'comments':
      return buildCommentsUrl(search.input);
    case 'subreddits':
      return buildSubredditsUrl(search.input);
    case 'users':
      return buildUsersUrl(search.input);
    case 'feed':
      return buildFeedUrl(search.input);
    case 'special':
      return search.url;
  }
};

export {
  buildPostsUrl,
  buildPostsQuery,
} from './posts';
export { buildCommentsUrl, buildCommentsQuery } from './comments';
export { buildSubredditsUrl } from './subreddits';
export { buildUsersUrl } from './users';
export { buildFeedUrl } from './feed';
export * from './types';
export * from './encode';
