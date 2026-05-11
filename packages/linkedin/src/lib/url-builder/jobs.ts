import { buildQuery, encodeCsv, encodeValue } from './encode';
import { RECENCY_SECONDS, type JobsInput } from './types';

const BASE = 'https://www.linkedin.com/jobs/search/';

/** True when the input has any facet filter beyond plain keyword/location.
 *  Used to decide whether to emit `origin=JOB_SEARCH_PAGE_JOB_FILTER`,
 *  the origin tag LinkedIn's UI sends when a filter is applied via the
 *  dropdown. Mirrors the posts builder's `hasAnyFacet` pattern. */
const hasAnyFacet = (i: JobsInput): boolean =>
  Boolean(
    i.sort ||
      (i.recency && i.recency !== 'any') ||
      i.workplaceTypes?.length ||
      i.experienceLevels?.length ||
      i.jobTypes?.length ||
      i.jobFunctions?.length ||
      i.companyIds?.length ||
      i.easyApply ||
      i.underTenApplicants ||
      i.hasVerifications ||
      i.inYourNetwork
  );

const mergeKeywords = (input: JobsInput): string | undefined => {
  const userKw = input.keywords?.trim() || '';
  const labels = [
    ...new Set(
      (input.companyKeywords ?? [])
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];
  if (labels.length === 0) return userKw || undefined;
  const quoted = labels.map((l) => `"${l}"`);
  const expr =
    quoted.length === 1 ? quoted[0] : `(${quoted.join(' OR ')})`;
  return userKw ? `${userKw} ${expr}` : expr;
};

export const buildJobsUrl = (input: JobsInput = {}): string => {
  const pairs: Array<readonly [string, string | undefined]> = [];

  if (hasAnyFacet(input)) {
    pairs.push(['origin', 'JOB_SEARCH_PAGE_JOB_FILTER'] as const);
  }

  const merged = mergeKeywords(input);
  if (merged) {
    pairs.push(['keywords', encodeValue(merged)] as const);
  }

  if (input.location && input.location.trim()) {
    pairs.push(['location', encodeValue(input.location.trim())] as const);
  }

  if (input.geoId) {
    pairs.push(['geoId', input.geoId] as const);
  }

  if (input.recency && input.recency !== 'any') {
    const seconds = RECENCY_SECONDS[input.recency];
    if (seconds !== undefined) {
      pairs.push(['f_TPR', `r${seconds}`] as const);
    }
  }

  if (input.sort) {
    pairs.push(['sortBy', input.sort] as const);
  }

  if (input.workplaceTypes && input.workplaceTypes.length > 0) {
    pairs.push(['f_WT', encodeCsv(input.workplaceTypes)] as const);
  }

  if (input.experienceLevels && input.experienceLevels.length > 0) {
    pairs.push(['f_E', encodeCsv(input.experienceLevels)] as const);
  }

  if (input.jobTypes && input.jobTypes.length > 0) {
    pairs.push(['f_JT', encodeCsv(input.jobTypes)] as const);
  }

  if (input.jobFunctions && input.jobFunctions.length > 0) {
    pairs.push(['f_F', encodeCsv(input.jobFunctions)] as const);
  }

  if (input.companyIds && input.companyIds.length > 0) {
    pairs.push(['f_C', encodeCsv(input.companyIds)] as const);
  }

  if (input.easyApply) pairs.push(['f_EA', 'true'] as const);
  if (input.underTenApplicants) pairs.push(['f_AL', 'true'] as const);
  if (input.hasVerifications) pairs.push(['f_VJ', 'true'] as const);
  if (input.inYourNetwork) pairs.push(['f_JIYN', 'true'] as const);

  return BASE + buildQuery(pairs);
};
