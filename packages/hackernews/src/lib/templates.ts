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
   * author, etc.) before it produces meaningful results.
   */
  requiresCustomize?: boolean;
}

export const BUILTIN_TEMPLATES: ReadonlyArray<Template> = [
  // ─── Front page (special URLs) ────────────────────────────────────
  {
    id: 'front-page',
    title: 'Front page right now',
    description:
      'The live HN front page. The pulse of what HN is reading at this moment.',
    group: 'Live',
    search: {
      type: 'special',
      url: 'https://news.ycombinator.com/news',
    },
  },
  {
    id: 'newest',
    title: 'Newest submissions',
    description: 'Every new story as it comes in. The raw firehose.',
    group: 'Live',
    search: {
      type: 'special',
      url: 'https://news.ycombinator.com/newest',
    },
  },

  // ─── Show HN / Ask HN — past week ────────────────────────────────
  {
    id: 'show-hn-week',
    title: 'Show HN — past week',
    description:
      'Side projects and demos shared in the past 7 days, ranked by popularity.',
    group: 'Posts',
    search: {
      type: 'search',
      input: {
        type: 'show_hn',
        dateRange: 'pastWeek',
        sort: 'byPopularity',
      },
    },
  },
  {
    id: 'ask-hn-week',
    title: 'Ask HN — past week',
    description:
      'Questions to the community in the past 7 days, ranked by popularity.',
    group: 'Posts',
    search: {
      type: 'search',
      input: {
        type: 'ask_hn',
        dateRange: 'pastWeek',
        sort: 'byPopularity',
      },
    },
  },

  // ─── Topic discovery ─────────────────────────────────────────────
  {
    id: 'topic-top-month',
    title: 'Top stories on a topic — past month',
    description:
      'Highest-popularity stories matching a keyword over the past 30 days. Customize the keyword.',
    group: 'Topics',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        keywords: 'rust',
        type: 'story',
        dateRange: 'pastMonth',
        sort: 'byPopularity',
      },
    },
  },
  {
    id: 'big-threads-this-year',
    title: '500-point threads this year',
    description:
      'Stories that crossed 500 points in the past 12 months — the year\'s genuinely-big discussions.',
    group: 'Topics',
    search: {
      type: 'search',
      input: {
        type: 'story',
        dateRange: 'pastYear',
        minPoints: 500,
        sort: 'byPopularity',
      },
    },
  },
  {
    id: 'high-engagement-comments-month',
    title: 'High-engagement threads — past month',
    description:
      'Stories with 100+ comments in the past month. Use to find what people are debating, not just upvoting.',
    group: 'Topics',
    search: {
      type: 'search',
      input: {
        type: 'story',
        dateRange: 'pastMonth',
        minComments: 100,
        sort: 'byPopularity',
      },
    },
  },

  // ─── Author scope ─────────────────────────────────────────────────
  {
    id: 'author-stories',
    title: "Author's stories — newest first",
    description:
      "All stories submitted by a HN user, newest first. Customize the username.",
    group: 'Authors',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        author: 'pg',
        type: 'story',
        sort: 'byDate',
      },
    },
  },
  {
    id: 'author-comments',
    title: "Author's comments — newest first",
    description:
      "All comments by a HN user, newest first. Customize the username.",
    group: 'Authors',
    requiresCustomize: true,
    search: {
      type: 'search',
      input: {
        author: 'pg',
        type: 'comment',
        sort: 'byDate',
      },
    },
  },
];
