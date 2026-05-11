import { buildQuery, encodeJsonArray, encodeValue } from './encode';
import type { PostsInput } from './types';

const BASE = 'https://www.linkedin.com/search/results/content/';

const mergeKeywords = (input: PostsInput): string | undefined => {
  const userKw = input.keywords?.trim() || '';
  const labels = [
    ...new Set(
      [
        ...(input.companyKeywords ?? []),
        ...(input.personKeywords ?? []),
      ]
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

/** True when the input contains any "facet" filter — anything beyond
 *  the bare keyword search. Used to decide whether to emit
 *  `origin=FACETED_SEARCH`. LinkedIn's UI tags every facet-filtered
 *  search with this origin and silently drops some filters (e.g. the
 *  date filter combined with fromMember) when it's missing. */
const hasAnyFacet = (i: PostsInput): boolean =>
  Boolean(
    i.sort ||
      (i.datePosted && i.datePosted !== 'any') ||
      i.postedBy?.length ||
      i.fromOrganizationIds?.length ||
      i.mentionsCompanyIds?.length ||
      i.fromMemberTokens?.length ||
      i.mentionsMemberTokens?.length ||
      i.contentType
  );

export const buildPostsUrl = (input: PostsInput = {}): string => {
  const pairs: Array<readonly [string, string | undefined]> = [];

  if (hasAnyFacet(input)) {
    pairs.push(['origin', 'FACETED_SEARCH'] as const);
  }

  const merged = mergeKeywords(input);
  if (merged) {
    pairs.push(['keywords', encodeValue(merged)] as const);
  }

  // sortBy and datePosted use JSON-array form (`sortBy=["date_posted"]`),
  // not bare-quoted. LinkedIn parses the bare form leniently for plain
  // searches but rejects it when combined with other facet filters,
  // returning zero results.
  if (input.sort) {
    pairs.push(['sortBy', encodeJsonArray([input.sort])] as const);
  }

  if (input.datePosted && input.datePosted !== 'any') {
    pairs.push(['datePosted', encodeJsonArray([input.datePosted])] as const);
  }

  if (input.postedBy && input.postedBy.length > 0) {
    pairs.push(['postedBy', encodeJsonArray(input.postedBy)] as const);
  }

  if (input.fromOrganizationIds && input.fromOrganizationIds.length > 0) {
    pairs.push([
      'fromOrganization',
      encodeJsonArray(input.fromOrganizationIds),
    ] as const);
  }

  // The URL parameter is `mentionsOrganization` even though our internal
  // field is `mentionsCompanyIds` (verified empirically against URLs
  // LinkedIn's UI generates). The mismatch keeps the field name
  // user-friendly ("company" reads more naturally than "organization").
  if (input.mentionsCompanyIds && input.mentionsCompanyIds.length > 0) {
    pairs.push([
      'mentionsOrganization',
      encodeJsonArray(input.mentionsCompanyIds),
    ] as const);
  }

  if (input.mentionsMemberTokens && input.mentionsMemberTokens.length > 0) {
    pairs.push([
      'mentionsMember',
      encodeJsonArray(input.mentionsMemberTokens),
    ] as const);
  }

  // fromMember takes opaque profile tokens (`ACoAA…`), bare in a JSON
  // array. The legacy URN form (`urn:li:fsd_member:<numeric>`) is now
  // silently dropped by LinkedIn and yields zero results.
  if (input.fromMemberTokens && input.fromMemberTokens.length > 0) {
    pairs.push(['fromMember', encodeJsonArray(input.fromMemberTokens)] as const);
  }

  if (input.contentType) {
    pairs.push(['contentType', encodeJsonArray([input.contentType])] as const);
  }

  return BASE + buildQuery(pairs);
};
