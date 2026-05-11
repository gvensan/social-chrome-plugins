import { buildQuery, encodeValue } from './encode';
import type { SubredditsInput } from './types';

const BASE = 'https://www.reddit.com/search/';

export const buildSubredditsUrl = (input: SubredditsInput = {}): string => {
  const kw = input.keywords?.trim();
  const pairs: Array<readonly [string, string | undefined]> = [
    ['q', kw ? encodeValue(kw) : undefined],
    ['type', 'sr'],
    ['sort', input.sort],
    ['include_over_18', input.includeOver18 ? 'on' : undefined],
  ];
  return BASE + buildQuery(pairs);
};
