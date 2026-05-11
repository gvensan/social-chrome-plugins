import { buildQuery, encodeValue } from './encode';
import type { UsersInput } from './types';

const BASE = 'https://www.reddit.com/search/';

export const buildUsersUrl = (input: UsersInput = {}): string => {
  const kw = input.keywords?.trim();
  const pairs: Array<readonly [string, string | undefined]> = [
    ['q', kw ? encodeValue(kw) : undefined],
    ['type', 'user'],
    ['sort', input.sort],
  ];
  return BASE + buildQuery(pairs);
};
