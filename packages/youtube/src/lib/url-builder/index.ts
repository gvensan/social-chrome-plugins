import { buildSearchUrl } from './search';
import type { SearchInput } from './types';

export const buildUrl = (search: SearchInput): string => {
  switch (search.type) {
    case 'search':
      return buildSearchUrl(search.input);
    case 'special':
      return search.url;
  }
};

export { buildSearchUrl } from './search';
export * from './types';
export * from './encode';
