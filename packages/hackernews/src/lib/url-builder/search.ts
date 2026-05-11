import {
  buildNumericFilters,
  buildQuery,
  sanitizeAuthor,
  trimOpt,
} from './encode';
import type { HNSearchInput } from './types';

const BASE = 'https://hn.algolia.com/';

export const buildSearchUrl = (input: HNSearchInput = {}): string => {
  const numericFilters = buildNumericFilters(
    input.minPoints,
    input.minComments
  );

  // dateRange='custom' activates the dateStart/dateEnd pair. For preset
  // ranges we drop those — Algolia ignores them anyway, but a clean URL
  // is easier to understand.
  const isCustom = input.dateRange === 'custom';
  const dateStart =
    isCustom && typeof input.dateStart === 'number'
      ? String(Math.floor(input.dateStart))
      : undefined;
  const dateEnd =
    isCustom && typeof input.dateEnd === 'number'
      ? String(Math.floor(input.dateEnd))
      : undefined;

  // `prefix=true` is Algolia's default; we omit it to keep URLs short
  // and only emit `prefix=false` when the user explicitly disables it.
  const prefix =
    input.prefix === false ? 'false' : undefined;

  const pairs: Array<readonly [string, string | undefined]> = [
    ['query', trimOpt(input.keywords)],
    ['type', input.type],
    ['sort', input.sort],
    ['dateRange', input.dateRange],
    ['dateStart', dateStart],
    ['dateEnd', dateEnd],
    ['author', sanitizeAuthor(input.author)],
    ['storyId', trimOpt(input.storyId)],
    ['numericFilters', numericFilters],
    ['prefix', prefix],
  ];
  return BASE + buildQuery(pairs);
};
