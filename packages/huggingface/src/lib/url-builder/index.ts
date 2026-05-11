import { buildModelsUrl } from './models';
import { buildDatasetsUrl } from './datasets';
import { buildSpacesUrl } from './spaces';
import type { SearchInput } from './types';

export const buildUrl = (search: SearchInput): string => {
  switch (search.type) {
    case 'models':
      return buildModelsUrl(search.input);
    case 'datasets':
      return buildDatasetsUrl(search.input);
    case 'spaces':
      return buildSpacesUrl(search.input);
    case 'special':
      return search.url;
  }
};

export { buildModelsUrl } from './models';
export { buildDatasetsUrl } from './datasets';
export { buildSpacesUrl } from './spaces';
export * from './types';
export * from './encode';
