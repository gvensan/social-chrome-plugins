// Single source of truth for the toolkit family. Every sibling extension
// imports this list to render its "Other extensions" section, so a user
// of one always discovers the others.
//
// Once a sibling is published, fill in its `webStoreUrl` and flip
// `status` to 'available'. Coming-soon entries render as disabled cards
// with no link.

export type SiblingStatus = 'available' | 'coming-soon';

export interface SiblingPlugin {
  /** Stable identifier matching the package directory name (e.g. `linkedin`). */
  id: string;
  /** Public-facing name shown in the side panel and store listing. */
  name: string;
  /** One-sentence pitch shown under the name in the family card. */
  description: string;
  /** Domain the plugin targets — used as a logo/background hint. */
  domain: string;
  /** Whether the plugin is published yet. */
  status: SiblingStatus;
  /** Chrome Web Store listing URL. Required when status === 'available'. */
  webStoreUrl?: string;
}

export const SIBLING_PLUGINS: ReadonlyArray<SiblingPlugin> = [
  {
    id: 'linkedin',
    name: 'LinkedIn Feed Toolkit',
    description: 'Compose LinkedIn search URLs — fresh jobs, network feed, topic monitor.',
    domain: 'linkedin.com',
    status: 'available',
    // TODO: replace with the real Web Store URL once published.
    webStoreUrl: undefined,
  },
  {
    id: 'github',
    name: 'GitHub Search Toolkit',
    description: 'Compose GitHub search queries with qualifier helpers (is:open, language:rust).',
    domain: 'github.com',
    status: 'available',
    webStoreUrl: undefined,
  },
  {
    id: 'x',
    name: 'X Search Toolkit',
    description: 'Compose advanced X (Twitter) searches with from:, since:, filter: operators.',
    domain: 'x.com',
    status: 'available',
    webStoreUrl: undefined,
  },
  {
    id: 'youtube',
    name: 'YouTube Search Toolkit',
    description: 'Compose YouTube search URLs with sp= filter presets — recency, duration, type, sort.',
    domain: 'youtube.com',
    status: 'available',
    webStoreUrl: undefined,
  },
  {
    id: 'reddit',
    name: 'Reddit Search Toolkit',
    description: 'Compose Reddit search and listing URLs — multireddits, top-of-week, link-target search, user feeds.',
    domain: 'reddit.com',
    status: 'available',
    webStoreUrl: undefined,
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Search Toolkit',
    description: 'Compose Hugging Face Models / Datasets / Spaces searches with task, library, license, modality, and size filters.',
    domain: 'huggingface.co',
    status: 'available',
    webStoreUrl: undefined,
  },
  {
    id: 'hackernews',
    name: 'Hacker News Search Toolkit',
    description: 'Compose Hacker News (Algolia) searches with points/comments thresholds, author, date range.',
    domain: 'news.ycombinator.com',
    status: 'available',
    webStoreUrl: undefined,
  },
];

export const findSibling = (id: string): SiblingPlugin | undefined =>
  SIBLING_PLUGINS.find((s) => s.id === id);

export const otherSiblings = (currentId: string): ReadonlyArray<SiblingPlugin> =>
  SIBLING_PLUGINS.filter((s) => s.id !== currentId);
