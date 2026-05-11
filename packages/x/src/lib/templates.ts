import type { SearchInput } from './url-builder/types';

export interface Template {
  id: string;
  title: string;
  description: string;
  search: SearchInput;
  experimental?: boolean;
  group?: string;
  /**
   * True when the template's URL is intentionally a starter shape that
   * needs the user to customize a hardcoded placeholder value (keyword,
   * username, list ID, etc.) before it produces meaningful results.
   */
  requiresCustomize?: boolean;
}

export const BUILTIN_TEMPLATES: ReadonlyArray<Template> = [
  {
    id: 'latest-from-user',
    title: 'Latest from a user',
    description:
      'Newest posts from a specific account. Customize the username; add filter:images via the Media filter to restrict to media posts.',
    group: 'Following',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        mode: 'latest',
        fromUser: 'elonmusk',
      },
    },
  },
  {
    id: 'multi-account-feed',
    title: 'Multi-account feed',
    description:
      'Latest posts from a curated set of accounts (3-5). Edit the keywords to swap usernames in the OR-list.',
    group: 'Following',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        mode: 'latest',
        keywords: '(from:elonmusk OR from:pmarca OR from:sama)',
        excludeRetweets: true,
      },
    },
  },
  {
    id: 'hashtag-pulse',
    title: 'Hashtag pulse',
    description:
      'Latest posts on a hashtag. Set a since: date in Customize to limit to recent posts.',
    group: 'Topics',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        mode: 'latest',
        hashtag: 'AIagents',
      },
    },
  },
  {
    id: 'original-takes-on-topic',
    title: 'Original takes on a topic',
    description:
      'Strips replies and retweets — only standalone posts on the topic. Low engagement floor catches lesser-known voices. Customize the keyword.',
    group: 'Topics',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        mode: 'latest',
        keywords: 'AI agents',
        filterReplies: 'exclude',
        excludeRetweets: true,
        minFaves: 50,
        language: 'en',
      },
    },
  },
  {
    id: 'high-engagement-topic',
    title: 'High-engagement on a topic',
    description:
      'Top posts above an engagement floor — finds the threads everyone is reacting to. Customize topic and threshold.',
    group: 'Topics',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        mode: 'top',
        keywords: 'AI agents',
        minFaves: 1000,
        language: 'en',
      },
    },
  },
  {
    id: 'list-latest',
    title: 'From a list — latest',
    description:
      'Latest posts from a list. Replace the list ID with your own — find it in the URL when viewing a list on x.com.',
    group: 'Lists & people',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        mode: 'latest',
        list: '123456789',
      },
    },
  },
  {
    id: 'find-people',
    title: 'Find people on X',
    description:
      'Search the People tab for accounts matching a phrase. Customize the search.',
    group: 'Lists & people',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        mode: 'people',
        keywords: 'climate scientist',
      },
    },
  },
  {
    id: 'bookmarks',
    title: 'Bookmarks',
    description: 'Opens your bookmarks (login required).',
    group: 'Mine',
    search: {
      type: 'special',
      url: 'https://x.com/i/bookmarks',
    },
  },
];
