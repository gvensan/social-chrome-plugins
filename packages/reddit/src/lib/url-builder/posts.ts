import {
  buildQuery,
  composeQ,
  encodeValue,
  opAuthor,
  opSelfType,
  opSubreddit,
  qualifier,
} from './encode';
import type { PostsInput } from './types';

const BASE = 'https://www.reddit.com/search/';

export const buildPostsQuery = (input: PostsInput = {}): string => {
  const fragments: Array<string | undefined> = [
    input.keywords?.trim() || undefined,
    opSubreddit(input.subreddit),
    opAuthor(input.author),
    qualifier('flair', input.flair),
    qualifier('title', input.title),
    qualifier('selftext', input.selftext),
    opSelfType(input.selfType),
    qualifier('url', input.url),
    qualifier('site', input.site),
  ];
  return composeQ(fragments);
};

export const buildPostsUrl = (input: PostsInput = {}): string => {
  const q = buildPostsQuery(input);
  const pairs: Array<readonly [string, string | undefined]> = [
    ['q', q ? encodeValue(q) : undefined],
    ['type', 'link'],
    ['sort', input.sort],
    ['t', input.time],
    ['include_over_18', input.includeOver18 ? 'on' : undefined],
  ];
  return BASE + buildQuery(pairs);
};
