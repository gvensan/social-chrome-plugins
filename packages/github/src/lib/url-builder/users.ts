import { buildSearchUrl, composeQ, qualifier } from './encode';
import type { UsersInput } from './types';

export const buildUsersUrl = (input: UsersInput = {}): string => {
  const fragments: Array<string | undefined> = [
    input.keywords?.trim() || undefined,
    qualifier('location', input.location),
    qualifier('language', input.language),
    qualifier('followers', input.followers),
    qualifier('repos', input.repos),
    qualifier('type', input.type),
  ];
  return buildSearchUrl(composeQ(fragments), 'users');
};
