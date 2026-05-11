import type { SearchInput } from './url-builder/types';

/**
 * Hint to the Builder when a template is loaded via Customize. Tells
 * the form which picker is the "point" so the irrelevant ones are
 * hidden — e.g., "Latest posts by a person" hides the From-a-company
 * picker and vice versa. Templates with no `focus` show all pickers
 * (the default Builder behavior).
 */
export type TemplateFocus = 'company' | 'person';

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
  focus?: TemplateFocus;
  /**
   * True when the template's URL is intentionally a starter shape that
   * needs the user to add a saved company / person via Customize before
   * it produces meaningful results. Direct-Open without setup yields a
   * generic firehose (e.g. "all jobs sorted by date") that looks broken.
   *
   * Templates with this flag render Customize as the primary action and
   * surface a "Setup needed" badge so the user understands the next
   * step before clicking Open.
   */
  requiresCustomize?: boolean;
}

export const BUILTIN_TEMPLATES: ReadonlyArray<Template> = [
  {
    id: 'network-feed-24h',
    title: 'Network feed — past 24h',
    description: 'Latest posts from your 1st connections + people you follow.',
    experimental: true,
    group: 'Posts',
    search: {
      type: 'posts',
      input: {
        sort: 'date_posted',
        datePosted: 'past-24h',
        postedBy: ['first', 'following'],
      },
    },
  },
  {
    id: 'posts-from-company-page',
    title: 'Latest posts from a company',
    description:
      'Latest posts published from a specific company\'s LinkedIn page (corporate announcements, hiring posts, product updates). Click Customize and pick a saved company under "From a company page."',
    experimental: true,
    group: 'Posts',
    focus: 'company',
    requiresCustomize: true,
    search: {
      type: 'posts',
      input: {
        sort: 'date_posted',
      },
    },
  },
  {
    id: 'posts-by-person',
    title: 'Latest posts by a person',
    description:
      'Latest posts authored by a specific individual — perfect for following a thought leader\'s feed without subscribing to LinkedIn alerts. Click Customize and pick a saved person under "By a person." Save people in the Filters tab via "From current tab" while on their profile.',
    experimental: true,
    group: 'Posts',
    focus: 'person',
    requiresCustomize: true,
    search: {
      type: 'posts',
      input: {
        sort: 'date_posted',
      },
    },
  },
  {
    id: 'topic-search',
    title: 'Search posts — past week',
    description:
      'Customize the keyword. Works for topics ("AI engineering"), hashtags (#solace), or company names ("Solace").',
    group: 'Posts',
    requiresCustomize: true,
    search: {
      type: 'posts',
      input: {
        keywords: 'AI engineering',
        sort: 'date_posted',
        datePosted: 'past-week',
      },
    },
  },
  {
    id: 'live-job-pulse',
    title: 'Live job pulse — past 15 min',
    description:
      'Newest postings only — refresh to monitor a target search. Customize keywords/filters before opening.',
    group: 'Jobs',
    search: {
      type: 'jobs',
      input: {
        recency: '15min',
        sort: 'DD',
      },
    },
  },
  {
    id: 'fresh-remote-easy-apply',
    title: 'Fresh remote + Easy Apply — past hour',
    description:
      'Remote-only, Easy Apply, posted in the past hour — for fast applying.',
    group: 'Jobs',
    search: {
      type: 'jobs',
      input: {
        recency: '1h',
        sort: 'DD',
        workplaceTypes: [3],
        easyApply: true,
      },
    },
  },
  {
    id: 'low-applicants-network-week',
    title: 'Under 10 applicants + in your network — past week',
    description:
      'Fresh jobs with fewer than 10 applicants at companies where you have a network connection — early-mover positioning.',
    group: 'Jobs',
    search: {
      type: 'jobs',
      input: {
        recency: 'week',
        sort: 'DD',
        underTenApplicants: true,
        inYourNetwork: true,
      },
    },
  },
  {
    id: 'jobs-at-company',
    title: 'Jobs at a company',
    description:
      'All open jobs at a specific company. Click Customize and pick a saved company. With an ID-backed company you get verified hiring plus a keyword recall fallback.',
    group: 'Jobs',
    requiresCustomize: true,
    search: {
      type: 'jobs',
      input: {
        sort: 'DD',
      },
    },
  },
  {
    id: 'jobs-at-company-in-network',
    title: 'Jobs at a company — in your network',
    description:
      'Open jobs at a specific company where you have a 1st-degree connection. Click Customize and pick a saved company. The "warm-application" template.',
    group: 'Jobs',
    requiresCustomize: true,
    search: {
      type: 'jobs',
      input: {
        sort: 'DD',
        inYourNetwork: true,
      },
    },
  },
  {
    id: 'recent-jobs-at-company-week',
    title: 'Recent jobs at a company — past week',
    description:
      'Jobs posted in the last 7 days at a specific company. Click Customize and pick a saved company.',
    group: 'Jobs',
    requiresCustomize: true,
    search: {
      type: 'jobs',
      input: {
        recency: 'week',
        sort: 'DD',
      },
    },
  },
  {
    id: 'people-by-title',
    title: 'People — by title in your network',
    description:
      '1st + 2nd connections by title. Click Customize to set the title (e.g. "founder", "engineering manager", "recruiter") and optionally pick a saved company to scope the search.',
    experimental: true,
    group: 'People',
    requiresCustomize: true,
    search: {
      type: 'people',
      input: {
        network: ['F', 'S'],
        titleFreeText: 'product manager',
      },
    },
  },
  {
    id: 'people-at-company',
    title: 'People at a company — in your network',
    description:
      'Find current and past employees of a company in your 1st + 2nd network. Click Customize and pick a saved company under "Currently at" and/or "Previously at." With an ID-backed company you get verified-employment filtering plus a keyword fallback for free recall.',
    experimental: true,
    group: 'People',
    requiresCustomize: true,
    search: {
      type: 'people',
      input: {
        network: ['F', 'S'],
      },
    },
  },
];
