import { buildRepositoriesUrl } from './repositories';
import { buildCodeUrl } from './code';
import { buildIssuesUrl } from './issues';
import { buildPullRequestsUrl } from './pullrequests';
import { buildUsersUrl } from './users';
import type { SearchInput } from './types';

export const buildUrl = (search: SearchInput): string => {
  switch (search.type) {
    case 'repositories':
      return buildRepositoriesUrl(search.input);
    case 'code':
      return buildCodeUrl(search.input);
    case 'issues':
      return buildIssuesUrl(search.input);
    case 'pullrequests':
      return buildPullRequestsUrl(search.input);
    case 'users':
      return buildUsersUrl(search.input);
    case 'special':
      return search.url;
  }
};

export {
  buildRepositoriesUrl,
  buildCodeUrl,
  buildIssuesUrl,
  buildPullRequestsUrl,
  buildUsersUrl,
};
export * from './types';
export * from './encode';
