import {
  buildQuery,
  composeQ,
  encodeValue,
  opAuthor,
  opSubreddit,
} from './encode';
import type { CommentsInput } from './types';

const BASE = 'https://www.reddit.com/search/';

export const buildCommentsQuery = (input: CommentsInput = {}): string => {
  const fragments: Array<string | undefined> = [
    input.keywords?.trim() || undefined,
    opSubreddit(input.subreddit),
    opAuthor(input.author),
  ];
  return composeQ(fragments);
};

export const buildCommentsUrl = (input: CommentsInput = {}): string => {
  const q = buildCommentsQuery(input);
  const pairs: Array<readonly [string, string | undefined]> = [
    ['q', q ? encodeValue(q) : undefined],
    ['type', 'comment'],
    ['sort', input.sort],
    ['t', input.time],
    ['include_over_18', input.includeOver18 ? 'on' : undefined],
  ];
  return BASE + buildQuery(pairs);
};
