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
   * channel name, etc.) before it produces meaningful results.
   */
  requiresCustomize?: boolean;
}

export const BUILTIN_TEMPLATES: ReadonlyArray<Template> = [
  {
    id: 'latest-tutorials',
    title: 'Latest tutorials on a topic',
    description:
      'Newest uploads matching a keyword, sorted by upload date. Customize the keyword.',
    group: 'By topic',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        keywords: 'python tutorial',
        preset: 'sort-upload-date',
      },
    },
  },
  {
    id: 'this-week-on-topic',
    title: 'This week on a topic',
    description: 'Videos uploaded in the last 7 days matching a keyword. Customize the keyword.',
    group: 'By topic',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        keywords: 'AI agents',
        preset: 'this-week',
      },
    },
  },
  {
    id: 'long-form-deep-dives',
    title: 'Long-form deep dives',
    description:
      'Videos longer than 20 minutes — full talks, lectures, deep tutorials. Customize the keyword.',
    group: 'By topic',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        keywords: 'system design',
        preset: 'long-videos',
      },
    },
  },
  {
    id: 'top-this-month',
    title: 'Top this month',
    description: 'Highest-view-count results for a topic. Customize the keyword.',
    group: 'By topic',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        keywords: 'machine learning',
        preset: 'sort-view-count',
      },
    },
  },
  {
    id: 'find-channel',
    title: 'Find a channel',
    description: 'Search the Channels tab for a creator. Customize the channel name.',
    group: 'Channels',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        keywords: 'fireship',
        preset: 'channels',
      },
    },
  },
  {
    id: 'hd-content',
    title: 'HD content this month',
    description: 'HD / 4K videos matching a keyword. Customize the keyword.',
    group: 'By topic',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        keywords: 'cinematography',
        preset: 'hd-only',
      },
    },
  },
  {
    id: 'trending',
    title: 'Trending',
    description: 'Trending videos right now.',
    group: 'Personal',
    search: {
      type: 'special',
      url: 'https://www.youtube.com/feed/trending',
    },
  },
  {
    id: 'subscriptions',
    title: 'My subscriptions',
    description: 'Your subscription feed (login required).',
    group: 'Personal',
    search: {
      type: 'special',
      url: 'https://www.youtube.com/feed/subscriptions',
    },
  },
];
