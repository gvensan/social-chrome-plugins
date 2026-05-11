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
   * username, repo, etc.) before it produces meaningful results.
   */
  requiresCustomize?: boolean;
}

export const BUILTIN_TEMPLATES: ReadonlyArray<Template> = [
  // ─── Personal inbox (special URLs) ─────────────────────────────────
  {
    id: 'prs-awaiting-review',
    title: 'PRs awaiting my review',
    description:
      'Pull requests across GitHub that have requested your review.',
    group: 'Inbox',
    search: {
      type: 'special',
      url: 'https://github.com/pulls/review-requested',
    },
  },
  {
    id: 'issues-assigned',
    title: 'Issues assigned to me',
    description: 'Open issues assigned to you across all repositories.',
    group: 'Inbox',
    search: {
      type: 'special',
      url: 'https://github.com/issues/assigned',
    },
  },
  {
    id: 'issues-mentioned',
    title: 'Issues mentioning me',
    description: 'Issues that @-mention you across all repositories.',
    group: 'Inbox',
    search: {
      type: 'special',
      url: 'https://github.com/issues/mentioned',
    },
  },

  // ─── My work (search-based personal queries) ──────────────────────
  {
    id: 'my-open-prs',
    title: 'My open PRs',
    description:
      'Open pull requests you authored across all repositories. Login required.',
    group: 'My work',
    search: {
      type: 'pullrequests',
      input: {
        author: '@me',
        state: 'open',
        sort: 'updated',
      },
    },
  },
  {
    id: 'my-open-issues',
    title: 'My open issues',
    description:
      'Open issues you authored across all repositories. Login required.',
    group: 'My work',
    search: {
      type: 'issues',
      input: {
        author: '@me',
        state: 'open',
        sort: 'updated',
      },
    },
  },

  // ─── Discover (open-source exploration) ───────────────────────────
  {
    id: 'trending-by-language',
    title: 'Trending repos in a language',
    description:
      'GitHub Trending page. URL params control language and period — edit the URL after opening, or use "Top repos by language" below for a Builder-customizable variant.',
    group: 'Discover',
    search: {
      type: 'special',
      url: 'https://github.com/trending/typescript?since=daily',
    },
  },
  {
    id: 'top-repos-by-language',
    title: 'Top repos by language',
    description:
      'Most-starred repositories in a language. Customize language and stars threshold.',
    group: 'Discover',
    requiresCustomize: true,
    search: {
      type: 'repositories',
      input: {
        language: 'rust',
        stars: '>10000',
        sort: 'stars',
      },
    },
  },
  {
    id: 'recently-updated-stack',
    title: 'Recently updated repos in my stack',
    description:
      'Active projects in a language, sorted by latest push. Different intent from "top stars" — surfaces alive, not famous. Customize language and pushed date.',
    group: 'Discover',
    requiresCustomize: true,
    search: {
      type: 'repositories',
      input: {
        language: 'typescript',
        pushed: '>2025-01-01',
        sort: 'updated',
      },
    },
  },
  {
    id: 'topic-discovery',
    title: 'Top repos by topic',
    description:
      'Repositories tagged with a GitHub topic, sorted by stars. Useful for niche discovery (e.g. topic:llm, topic:zero-knowledge). Customize the topic.',
    group: 'Discover',
    requiresCustomize: true,
    search: {
      type: 'repositories',
      input: {
        topic: 'llm',
        sort: 'stars',
      },
    },
  },
  {
    id: 'license-friendly-search',
    title: 'License-friendly project search',
    description:
      'Projects with a permissive license, above a quality bar. Customize language and license (mit / apache-2.0 / bsd-3-clause).',
    group: 'Discover',
    requiresCustomize: true,
    search: {
      type: 'repositories',
      input: {
        language: 'python',
        license: 'mit',
        stars: '>500',
        sort: 'stars',
      },
    },
  },

  // ─── Contribute (find a way in) ────────────────────────────────────
  {
    id: 'good-first-issues',
    title: 'Good first issues in a language',
    description:
      'Open, unassigned issues labeled "good first issue" in a language. The classic "where do I start contributing" template.',
    group: 'Contribute',
    search: {
      type: 'issues',
      input: {
        state: 'open',
        label: 'good first issue',
        unassigned: true,
        language: 'typescript',
        sort: 'updated',
      },
    },
  },

  // ─── Per-repo / per-org workflows ──────────────────────────────────
  {
    id: 'open-prs-in-repo',
    title: 'Open PRs in a repo',
    description: 'Open pull requests in a specific repo. Customize the repo.',
    group: 'Repos & code',
    requiresCustomize: true,
    search: {
      type: 'pullrequests',
      input: {
        repo: 'owner/name',
        state: 'open',
      },
    },
  },
  {
    id: 'recent-code-in-org',
    title: 'Code search in an org',
    description: 'Code search scoped to an org. Customize org and keyword.',
    group: 'Repos & code',
    requiresCustomize: true,
    search: {
      type: 'code',
      input: {
        user: 'YourOrg',
        keywords: 'TODO',
      },
    },
  },
  {
    id: 'find-users-by-location-language',
    title: 'Find users by location and language',
    description:
      'Users matching a location and primary language. Useful for hiring or finding collaborators.',
    group: 'Repos & code',
    requiresCustomize: true,
    search: {
      type: 'users',
      input: {
        location: 'San Francisco',
        language: 'rust',
      },
    },
  },
];
