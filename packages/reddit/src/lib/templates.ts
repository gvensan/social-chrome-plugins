import type { SearchInput } from './url-builder/types';

export interface Template {
  id: string;
  title: string;
  description: string;
  search: SearchInput;
  experimental?: boolean;
  /** Section heading in the Templates view. Templates with the same
   *  group are rendered together under a collapsible section. Order of
   *  first appearance defines the section's vertical position. */
  group?: string;
  /**
   * True when the template's URL is intentionally a starter shape that
   * needs the user to customize a hardcoded placeholder value (keyword,
   * username, subreddit, etc.) before it produces meaningful results.
   */
  requiresCustomize?: boolean;
}

export const BUILTIN_TEMPLATES: ReadonlyArray<Template> = [
  // ─── Personal feeds (login-bound but URL-only) ─────────────────────
  {
    id: 'home-feed',
    title: 'My home feed',
    description:
      'The home feed for your logged-in account. Login required.',
    group: 'Personal',
    search: {
      type: 'special',
      url: 'https://www.reddit.com/',
    },
  },
  {
    id: 'inbox',
    title: 'My inbox',
    description: 'Your message and reply inbox. Login required.',
    group: 'Personal',
    search: {
      type: 'special',
      url: 'https://www.reddit.com/message/inbox/',
    },
  },

  // ─── Listings (sub / multi / global) ──────────────────────────────
  {
    id: 'all-hot-now',
    title: 'r/all — hot now',
    description: 'The Reddit-wide "hot" feed. Anything trending site-wide.',
    group: 'Listings',
    search: {
      type: 'feed',
      input: {
        target: { kind: 'global', scope: 'all' },
        sort: 'hot',
      },
    },
  },
  {
    id: 'popular-top-week',
    title: 'r/popular — top this week',
    description:
      'Top posts in r/popular over the past 7 days. Editorially de-NSFW-ed.',
    group: 'Listings',
    search: {
      type: 'feed',
      input: {
        target: { kind: 'global', scope: 'popular' },
        sort: 'top',
        time: 'week',
      },
    },
  },
  {
    id: 'subreddit-top-all-time',
    title: 'Top all-time in a subreddit',
    description:
      'Highest-scoring posts ever in a subreddit. Customize the subreddit (e.g. AskScience, programming).',
    group: 'Listings',
    requiresCustomize: true,
    search: {
      type: 'feed',
      input: {
        target: { kind: 'subreddits', names: ['programming'] },
        sort: 'top',
        time: 'all',
      },
    },
  },
  {
    id: 'subreddit-rising',
    title: 'Rising in a subreddit',
    description:
      'Posts gaining velocity right now in a subreddit. Edit the sub to monitor a niche community.',
    group: 'Listings',
    requiresCustomize: true,
    search: {
      type: 'feed',
      input: {
        target: { kind: 'subreddits', names: ['rust'] },
        sort: 'rising',
      },
    },
  },
  {
    id: 'multireddit-top-day',
    title: 'Multireddit — top today',
    description:
      'Top posts across multiple subreddits at once (a multireddit). Customize the list — e.g. rust+golang+typescript.',
    group: 'Listings',
    requiresCustomize: true,
    search: {
      type: 'feed',
      input: {
        target: {
          kind: 'subreddits',
          names: ['rust', 'golang', 'typescript'],
        },
        sort: 'top',
        time: 'day',
      },
    },
  },

  // ─── Topic discovery (search-based) ───────────────────────────────
  {
    id: 'topic-top-week',
    title: 'Top posts on a topic this week',
    description:
      'Highest-scoring posts matching a keyword over the past 7 days. Customize the keyword.',
    group: 'Topics',
    requiresCustomize: true,
    search: {
      type: 'posts',
      input: {
        keywords: 'AI agents',
        sort: 'top',
        time: 'week',
      },
    },
  },
  {
    id: 'topic-most-comments',
    title: 'Most-discussed threads on a topic',
    description:
      'Posts with the most comments over the past month — finds the threads people are arguing about.',
    group: 'Topics',
    requiresCustomize: true,
    search: {
      type: 'posts',
      input: {
        keywords: 'AI safety',
        sort: 'comments',
        time: 'month',
      },
    },
  },
  {
    id: 'self-posts-on-topic',
    title: 'Self-posts on a topic — newest',
    description:
      'Strips out link-share spam — only text posts (discussions, questions, write-ups). Newest first.',
    group: 'Topics',
    requiresCustomize: true,
    search: {
      type: 'posts',
      input: {
        keywords: 'machine learning',
        selfType: 'self',
        sort: 'new',
      },
    },
  },
  {
    id: 'link-target-domain',
    title: 'Posts linking to a domain',
    description:
      'Posts that link to a specific domain (e.g. github.com, arxiv.org, nytimes.com). Powerful for monitoring how Reddit reacts to new releases or articles.',
    group: 'Topics',
    requiresCustomize: true,
    search: {
      type: 'posts',
      input: {
        site: 'github.com',
        sort: 'new',
      },
    },
  },

  // ─── Subreddit + author scoping ───────────────────────────────────
  {
    id: 'questions-in-sub',
    title: 'Question-flair posts in a sub',
    description:
      'Posts tagged with a Question/Discussion flair in a subreddit. Customize sub + flair text.',
    group: 'Scoped',
    requiresCustomize: true,
    search: {
      type: 'posts',
      input: {
        subreddit: 'AskScience',
        flair: 'Question',
        sort: 'new',
      },
    },
  },
  {
    id: 'amas-this-week',
    title: 'AMAs this week',
    description:
      'Top AMAs (Ask Me Anything) posted in r/IAmA over the past 7 days.',
    group: 'Scoped',
    search: {
      type: 'posts',
      input: {
        subreddit: 'IAmA',
        sort: 'top',
        time: 'week',
      },
    },
  },
  {
    id: 'author-top-year',
    title: "User's top submissions this year",
    description:
      "A user's highest-scoring submissions over the past 12 months. Customize the username.",
    group: 'Scoped',
    requiresCustomize: true,
    search: {
      type: 'feed',
      input: {
        target: { kind: 'user', username: 'spez', tab: 'submitted' },
        sort: 'top',
        time: 'year',
      },
    },
  },
  {
    id: 'author-recent-comments',
    title: "User's recent comments",
    description:
      "A user's newest comments. Customize the username.",
    group: 'Scoped',
    requiresCustomize: true,
    search: {
      type: 'feed',
      input: {
        target: { kind: 'user', username: 'spez', tab: 'comments' },
        sort: 'new',
      },
    },
  },

  // ─── Discovery (find subs/users) ──────────────────────────────────
  {
    id: 'find-subreddits',
    title: 'Find subreddits about a topic',
    description:
      'Searches the Subreddits tab for communities matching a keyword. Customize the keyword.',
    group: 'Discover',
    requiresCustomize: true,
    search: {
      type: 'subreddits',
      input: {
        keywords: 'machine learning',
        sort: 'activity',
      },
    },
  },
  {
    id: 'find-users',
    title: 'Find users by handle',
    description:
      'Searches the Users tab. Best for finding accounts whose username contains a keyword.',
    group: 'Discover',
    requiresCustomize: true,
    search: {
      type: 'users',
      input: {
        keywords: 'climate',
        sort: 'activity',
      },
    },
  },
];
