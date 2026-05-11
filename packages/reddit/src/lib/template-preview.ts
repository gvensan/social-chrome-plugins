import type {
  CommentsInput,
  FeedInput,
  PostsInput,
  SearchInput,
  SubredditsInput,
  UsersInput,
} from './url-builder/types';

const summarizePosts = (i: PostsInput): string => {
  const bits: string[] = ['type: posts'];
  if (i.keywords?.trim()) bits.push(`keywords: "${i.keywords.trim()}"`);
  if (i.subreddit) bits.push(`subreddit:${i.subreddit}`);
  if (i.author) bits.push(`author:${i.author}`);
  if (i.flair) bits.push(`flair:${i.flair}`);
  if (i.title) bits.push(`title:${i.title}`);
  if (i.selftext) bits.push(`selftext:${i.selftext}`);
  if (i.selfType === 'self') bits.push('self-posts only');
  if (i.selfType === 'link') bits.push('link posts only');
  if (i.url) bits.push(`url:${i.url}`);
  if (i.site) bits.push(`site:${i.site}`);
  if (i.includeOver18) bits.push('include NSFW');
  if (i.sort) bits.push(`sort:${i.sort}`);
  if (i.time) bits.push(`t:${i.time}`);
  return bits.join(' · ');
};

const summarizeComments = (i: CommentsInput): string => {
  const bits: string[] = ['type: comments'];
  if (i.keywords?.trim()) bits.push(`keywords: "${i.keywords.trim()}"`);
  if (i.subreddit) bits.push(`subreddit:${i.subreddit}`);
  if (i.author) bits.push(`author:${i.author}`);
  if (i.includeOver18) bits.push('include NSFW');
  if (i.sort) bits.push(`sort:${i.sort}`);
  if (i.time) bits.push(`t:${i.time}`);
  return bits.join(' · ');
};

const summarizeSubreddits = (i: SubredditsInput): string => {
  const bits: string[] = ['type: subreddits'];
  if (i.keywords?.trim()) bits.push(`keywords: "${i.keywords.trim()}"`);
  if (i.includeOver18) bits.push('include NSFW');
  if (i.sort) bits.push(`sort:${i.sort}`);
  return bits.join(' · ');
};

const summarizeUsers = (i: UsersInput): string => {
  const bits: string[] = ['type: users'];
  if (i.keywords?.trim()) bits.push(`keywords: "${i.keywords.trim()}"`);
  if (i.sort) bits.push(`sort:${i.sort}`);
  return bits.join(' · ');
};

const summarizeFeed = (i: FeedInput): string => {
  const bits: string[] = ['type: feed'];
  if (i.target) {
    const t = i.target;
    if (t.kind === 'subreddits') {
      const cleaned = t.names.filter((n) => n.trim().length > 0);
      bits.push(`r/${cleaned.join('+')}`);
    } else if (t.kind === 'global') {
      bits.push(`r/${t.scope}`);
    } else {
      bits.push(`u/${t.username} → ${t.tab}`);
    }
  }
  if (i.sort) bits.push(`sort:${i.sort}`);
  if (i.time) bits.push(`t:${i.time}`);
  if (i.geoFilter) bits.push(`geo:${i.geoFilter}`);
  return bits.join(' · ');
};

export const summarizeSearch = (s: SearchInput): string => {
  switch (s.type) {
    case 'posts':
      return summarizePosts(s.input);
    case 'comments':
      return summarizeComments(s.input);
    case 'subreddits':
      return summarizeSubreddits(s.input);
    case 'users':
      return summarizeUsers(s.input);
    case 'feed':
      return summarizeFeed(s.input);
    case 'special':
      try {
        const u = new URL(s.url);
        return `direct: ${u.hostname}${u.pathname}${u.search}`;
      } catch {
        return `direct: ${s.url}`;
      }
  }
};
