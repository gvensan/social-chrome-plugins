import { buildPostsUrl } from './posts';
import { buildJobsUrl } from './jobs';
import { buildPeopleUrl } from './people';
import type { SearchInput } from './types';

export const buildUrl = (search: SearchInput): string => {
  switch (search.type) {
    case 'posts':
      return buildPostsUrl(search.input);
    case 'jobs':
      return buildJobsUrl(search.input);
    case 'people':
      return buildPeopleUrl(search.input);
  }
};

export { buildPostsUrl, buildJobsUrl, buildPeopleUrl };
export * from './types';
export * from './encode';
