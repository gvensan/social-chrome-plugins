import { buildSearchUrl, composeQ, qualifier } from './encode';
import type { RepositoriesInput } from './types';

export const buildRepositoriesUrl = (input: RepositoriesInput = {}): string => {
  const fragments: Array<string | undefined> = [
    input.keywords?.trim() || undefined,
    qualifier('user', input.user),
    qualifier('language', input.language),
    qualifier('topic', input.topic),
    qualifier('license', input.license),
    qualifier('stars', input.stars),
    qualifier('forks', input.forks),
    qualifier('pushed', input.pushed),
    input.archived === true
      ? 'archived:true'
      : input.archived === false
        ? 'archived:false'
        : undefined,
    qualifier('sort', input.sort),
  ];
  return buildSearchUrl(composeQ(fragments), 'repositories');
};
