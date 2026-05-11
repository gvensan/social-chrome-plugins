import {
  buildQuery,
  encodeValue,
  filterForMode,
  opExcludeRetweets,
  opFromUser,
  opHashtag,
  opLang,
  opList,
  opMedia,
  opMentioning,
  opMinFaves,
  opMinReplies,
  opMinRetweets,
  opReplies,
  opSince,
  opToUser,
  opUntil,
  opVerified,
} from './encode';
import type { XSearchInput } from './types';

const BASE = 'https://x.com/search';

export const buildQueryString = (input: XSearchInput): string => {
  const parts: Array<string | undefined> = [
    input.keywords?.trim() || undefined,
    opFromUser(input.fromUser),
    opToUser(input.toUser),
    opMentioning(input.mentioning),
    opHashtag(input.hashtag),
    opSince(input.since),
    opUntil(input.until),
    opMinFaves(input.minFaves),
    opMinRetweets(input.minRetweets),
    opMinReplies(input.minReplies),
    opLang(input.language),
    opList(input.list),
    opReplies(input.filterReplies),
    opMedia(input.filterMedia),
    opVerified(input.verifiedOnly),
    opExcludeRetweets(input.excludeRetweets),
  ];
  return parts.filter((p): p is string => Boolean(p)).join(' ');
};

export const buildSearchUrl = (input: XSearchInput): string => {
  const q = buildQueryString(input);
  const f = filterForMode(input.mode);
  const pairs: Array<readonly [string, string | undefined]> = [
    ['q', q ? encodeValue(q) : undefined],
    ['src', 'typed_query'],
    ['f', f],
  ];
  return BASE + buildQuery(pairs);
};
