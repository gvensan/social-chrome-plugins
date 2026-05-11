import { buildQuery, encodeJsonArray, encodeValue } from './encode';
import type { PeopleInput } from './types';

const BASE = 'https://www.linkedin.com/search/results/people/';

const mergeKeywords = (input: PeopleInput): string | undefined => {
  const userKw = input.keywords?.trim() || '';
  // Deduplicate: keyword search doesn't distinguish current vs past,
  // so the same label appearing in both buckets becomes one term.
  const companyLabels = [
    ...new Set(
      [
        ...(input.currentCompanyKeywords ?? []),
        ...(input.pastCompanyKeywords ?? []),
      ]
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];

  if (companyLabels.length === 0) return userKw || undefined;

  const quoted = companyLabels.map((l) => `"${l}"`);
  const companyExpr =
    quoted.length === 1 ? quoted[0] : `(${quoted.join(' OR ')})`;

  return userKw ? `${userKw} ${companyExpr}` : companyExpr;
};

export const buildPeopleUrl = (input: PeopleInput = {}): string => {
  const pairs: Array<readonly [string, string | undefined]> = [];

  const merged = mergeKeywords(input);
  if (merged) {
    pairs.push(['keywords', encodeValue(merged)] as const);
  }

  if (input.network && input.network.length > 0) {
    pairs.push(['network', encodeJsonArray(input.network)] as const);
  }

  if (input.titleFreeText && input.titleFreeText.trim()) {
    pairs.push([
      'titleFreeText',
      encodeValue(input.titleFreeText.trim()),
    ] as const);
  }

  if (input.currentCompanyIds && input.currentCompanyIds.length > 0) {
    pairs.push([
      'currentCompany',
      encodeJsonArray(input.currentCompanyIds),
    ] as const);
  }

  if (input.pastCompanyIds && input.pastCompanyIds.length > 0) {
    pairs.push([
      'pastCompany',
      encodeJsonArray(input.pastCompanyIds),
    ] as const);
  }

  if (input.industryIds && input.industryIds.length > 0) {
    pairs.push([
      'industryCompany',
      encodeJsonArray(input.industryIds),
    ] as const);
  }

  return BASE + buildQuery(pairs);
};
