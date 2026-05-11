# Browser Search Toolkit

A monorepo of lightweight Chrome extensions that compose, save, and
launch high-signal search URLs on platforms whose search syntax is
opaque to most users. **Seven plugins** shipping in this repo:

- **LinkedIn Feed Toolkit (Unofficial)** (`packages/linkedin/`) — recent posts from
  people you follow, ultra-fresh job listings, topic monitors,
  targeted people searches with saved company/person filters.
- **GitHub Search Toolkit (Unofficial)** (`packages/github/`) — qualifier-helper
  builders for repositories / code / issues / PRs / users; trending
  + review queue + assigned-issues "inbox" templates.
- **X Search Toolkit (Unofficial)** (`packages/x/`) — advanced-search composer
  with operator helpers (`from:`, `since:`, `min_faves:`,
  `filter:images`); per-mode tabs (Top / Latest / People / Media).
- **YouTube Search Toolkit (Unofficial)** (`packages/youtube/`) — keyword search
  with preset filters (today / this week / HD / long-form / CC license)
  using YouTube's opaque `sp=` filter parameter.
- **Reddit Search Toolkit (Unofficial)** (`packages/reddit/`) — posts / comments /
  subreddits / users / feed search builders.
- **Hugging Face Search Toolkit (Unofficial)** (`packages/huggingface/`) — models /
  datasets / spaces search with task, license, and library filters.
- **Hacker News Search Toolkit (Unofficial)** (`packages/hackernews/`) — Algolia-
  powered HN search with author, time-range, and story-vs-comment
  scoping.

None of these scrape, automate, or read page content. They only
generate URLs and open them in your existing browser session.

- Manifest V3. Most plugins declare only `storage` + `sidePanel`
  (no host permissions, no `activeTab`, no `scripting`); they call
  `chrome.tabs.create()` to open generated URLs. LinkedIn additionally
  declares `host_permissions: ["*://*.linkedin.com/*"]` + `scripting`
  to power the user-triggered "From current tab" capture for saved
  companies/people — explained in detail in `packages/linkedin/README.md`.
- Opens as a **side panel** by default; switchable to a classic popup in Settings.
- Bundle per extension: ~50 KB gzipped JS + ~5 KB CSS.
- Stack: Vite + Svelte 5 + TypeScript + Tailwind + `@crxjs/vite-plugin`.
- Layout: npm workspaces with `@toolkit/core` shared package.

For per-plugin usage, templates, and quirks, see each plugin's README:

- [`packages/linkedin/README.md`](packages/linkedin/README.md)
- [`packages/github/README.md`](packages/github/README.md)
- [`packages/x/README.md`](packages/x/README.md)
- [`packages/youtube/README.md`](packages/youtube/README.md)
- [`packages/reddit/README.md`](packages/reddit/README.md)
- [`packages/huggingface/README.md`](packages/huggingface/README.md)
- [`packages/hackernews/README.md`](packages/hackernews/README.md)

## Quick start

```bash
npm install                       # at the monorepo root
npm run build                     # builds all 7 plugins in parallel
```

Then in Chrome → `chrome://extensions` → enable **Developer mode** →
click **Load unpacked** for each plugin you want to install:

- `packages/linkedin/dist/`
- `packages/github/dist/`
- `packages/x/dist/`
- `packages/youtube/dist/`
- `packages/reddit/dist/`
- `packages/huggingface/dist/`
- `packages/hackernews/dist/`

You can install one, some, or all seven independently. Each operates
in its own side panel and shares no runtime state with the others —
the cross-promotion in About → "More from this publisher" is
purely informational (driven by `packages/core/src/family.ts`).

You must be signed in to the target platform in the same Chrome
profile for personalized templates (e.g. "PRs awaiting my review",
"Network feed", "From a list — latest") to return results.

## Development

From the repo root:

```bash
# Build all seven plugins
npm run build

# Build a single plugin
npm run build:linkedin
npm run build:github
npm run build:x
npm run build:youtube
npm run build:reddit
npm run build:huggingface
npm run build:hackernews

# Vite dev server with HMR (single plugin at a time)
npm run dev:linkedin    # default: also `npm run dev`
npm run dev:github
npm run dev:x
npm run dev:youtube
npm run dev:reddit
npm run dev:huggingface
npm run dev:hackernews

# Tests across all packages (Vitest)
npm test                # runs every plugin's suite (~250 tests total)
npm run test:linkedin
npm run test:github
npm run test:x
npm run test:youtube
npm run test:reddit
npm run test:huggingface
npm run test:hackernews

# Type check across all packages
npm run check

# Build + zip release artifacts → release/
npm run release:linkedin
npm run release:all     # all 7 sequentially; --publish flag also uploads to CWS

# Prettier across packages/**/src
npm run format
```

To work inside a specific package directly (rare, prefer the root
scripts):

```bash
npm run dev -w @toolkit/github-extension
```

Edit any file under `packages/`; Vite rebuilds; reload the extension
in `chrome://extensions` to pick up changes (or just reopen the side
panel for popup-only changes).

## What each plugin does

All seven follow the same shape: **Templates** view (one-click
recipes), **Builder** view (typed forms per search type), **Saved**
view (your library), **Filters** view (saved entities for some
plugins), **Settings** view (theme, display mode, defaults, JSON
backup/restore), **About** view (cross-promotion). They differ in
what their search URLs look like:

| Plugin | URL family | Builder shape |
| --- | --- | --- |
| LinkedIn | `linkedin.com/search/results/<type>/?<typed-params>` plus `/jobs/search/?<jobs-params>` | 3 form tabs: Posts, Jobs, People — typed parameters per tab |
| GitHub | `github.com/search?q=<qualifiers>&type=<type>` plus a few "inbox" URLs (`/pulls/review-requested`, `/trending/<lang>`) | 5 form tabs: Repositories, Code, Issues, Pull Requests, Users — qualifier-stacked queries |
| X | `x.com/search?q=<operators>&src=typed_query&f=<filter>` | 1 form with mode tabs (Top / Latest / People / Media) — operator-stacked queries |
| YouTube | `youtube.com/results?search_query=<kw>&sp=<preset>` | 1 form with preset categories (today / this week / HD / long-form / CC license / channels / playlists) — opaque `sp=` filter tokens |
| Reddit | `reddit.com/search/?q=<kw>&type=<type>&sort=<s>&t=<t>` plus subreddit / multireddit listing URLs | 5 form tabs: Posts, Comments, Subreddits, Users, Feed |
| Hugging Face | `huggingface.co/models?<facets>` (plus datasets / spaces) | 3 form tabs: Models, Datasets, Spaces — pipeline-tag + library + license facets |
| Hacker News | `hn.algolia.com/?q=<kw>&type=<t>&dateRange=<r>` | 1 form with story-vs-comment + author + time-range scoping |

LinkedIn additionally ships **saved companies and people** (Filters
view): because LinkedIn's search filters by numeric company ID and
opaque profile token (not by name), users save these entities once
with a friendly label and pick them as chips in the People / Posts
builders under "Currently at" / "Previously at" / "From a company" /
"From a person." Other plugins use plain string identifiers and don't
need a saved-entity layer.

## Project structure

```
package.json                   — npm workspace root (build/dev/test/release scripts per plugin)
tsconfig.base.json             — shared TS compiler options
.github/workflows/release.yml  — tag-triggered CI: zip + GitHub release + (optional) CWS upload
scripts/
  generate-icons.mjs           — placeholder PNG generator (per-package)
  release.mjs                  — build + zip one package, --publish to upload to CWS
  release-all.mjs              — sequentially release every plugin
documents/
  Requirements.md              — full scope, parameter catalog, risks
  PUBLISHING.md                — Chrome Web Store step-by-step
  STORAGE.md                   — chrome.storage.local architecture
  GROK Summary.md              — original parameter research

packages/
  core/                        — @toolkit/core (shared)
    src/
      storage.ts               — chrome.storage.local with in-memory fallback
      browser.ts               — chrome.tabs.create / current-tab update / copy helpers
      family.ts                — sibling-plugin discovery list
      backup.ts                — buildExport / restoreImport with pluggable per-plugin validator
      stores/
        router.svelte.ts       — generic view router
        saved.svelte.ts        — generic SavedSearchesStore<T> (each plugin instantiates)
      components/              — Tabs, Toggle, ChipGroup, Select, KeywordsField,
                                 BooleanHelper, CollapsibleSection, FamilyCard,
                                 FamilySection, SaveSearchDialog, SavedSearchRow,
                                 EditingBanner, Spinner
      index.ts                 — public API surface

  linkedin/                    — @toolkit/linkedin-extension (host_permissions for LinkedIn)
  github/                      — @toolkit/github-extension
  x/                           — @toolkit/x-extension
  youtube/                     — @toolkit/youtube-extension
  reddit/                      — @toolkit/reddit-extension
  huggingface/                 — @toolkit/huggingface-extension
  hackernews/                  — @toolkit/hackernews-extension
```

Each plugin package follows the same internal layout:

```
src/
  manifest.json                — MV3 manifest (minimum: storage + sidePanel)
  background/service-worker.ts — popup-vs-sidepanel toggle for the action click
  lib/
    url-builder/               — typed URL builders per search type
    params.ts                  — option lists for select/chip controls
    templates.ts               — built-in template list (BUILTIN_TEMPLATES)
    template-preview.ts        — one-line human summary per template card
  popup/
    App.svelte                 — root + view router
    components/                — *Form per search type + shared list components
    stores/                    — builder / saved (4-line shim) / settings
    views/                     — Templates / Builder / Saved / (Filters) / Settings / About
tests/                         — vitest (url-builder + parsers)
public/icons/                  — toolbar + store icons
```

Shared infrastructure — Save dialog, Saved row, generic store class,
storage helpers, view router, all the small Svelte primitives — lives
in `packages/core` and is imported via `@toolkit/core`. Adding a new
plugin involves writing its own `lib/url-builder/`, `lib/templates.ts`,
and `*Form.svelte` files; everything else is reused.

## Extending it

### Add a new built-in template

1. Open `packages/<plugin>/src/lib/templates.ts`.
2. Append an entry to `BUILTIN_TEMPLATES` with a unique `id`, title,
   description, and `search` matching the existing shapes for that
   plugin.
3. Run `npm run test:<plugin>` — the suite verifies every template
   produces a valid platform URL and that all IDs are unique.

### Add a new parameter to an existing search type

1. Add the field to the input interface in
   `packages/<plugin>/src/lib/url-builder/types.ts`.
2. Emit it in the corresponding builder file.
3. Add a test case in `packages/<plugin>/tests/url-builder.test.ts`.
4. (Optional) Surface it in the form: add option list to
   `packages/<plugin>/src/lib/params.ts` and a control in the relevant
   `*Form.svelte`.

### Add a new platform extension

The 6 sibling packages (github / x / youtube / reddit / huggingface /
hackernews) were scaffolded from `packages/linkedin/` and serve as
up-to-date references:

1. Copy `packages/linkedin/` to `packages/<platform>/`.
2. Rename the package in its `package.json` to
   `@toolkit/<platform>-extension`.
3. Replace `src/lib/url-builder/`, `src/lib/params.ts`,
   `src/lib/templates.ts` with platform-specific equivalents.
4. Tune the `*Form.svelte` files for the new fields, and adjust
   `BuilderView.svelte` if the platform needs a different number of
   form tabs (or a single form with mode tabs, like X / hackernews).
5. Update `src/manifest.json` (name, description, icons).
6. Update `currentId` in `SettingsView.svelte`'s `<FamilySection>`
   (or About view) and add the entry to `packages/core/src/family.ts`.
7. Add `dev:<platform>`, `build:<platform>`, `test:<platform>`,
   `release:<platform>` scripts to the root `package.json`.
8. Append `<platform>-v*` to the tag-trigger list in
   `.github/workflows/release.yml`.
9. `npm install` to wire the new workspace package.

Most of `@toolkit/core` is reusable as-is — `SaveSearchDialog`,
`SavedSearchRow`, `SavedSearchesStore<T>`, all the small primitives
(Tabs, Toggle, ChipGroup, Select, KeywordsField, BooleanHelper,
Spinner, EditingBanner), storage layer, browser helpers, and the view
router carry over.

### Replace placeholder icons

```bash
node scripts/generate-icons.mjs <plugin>      # any of the 7 plugin names
```

Or drop real PNGs at
`packages/<plugin>/public/icons/icon-{16,32,48,128}.png`.

## Releasing to the Chrome Web Store

See **`documents/PUBLISHING.md`** for the full step-by-step. Short
version:

```bash
npm run release:linkedin                 # build + zip → release/
npm run release:all                      # all 7 sequentially
node scripts/release.mjs linkedin --publish  # upload to CWS (needs env vars)
```

Or tag-triggered CI: bump `manifest.json` + `package.json` versions,
commit, then `git tag linkedin-v0.2.0 && git push --tags`. The
`.github/workflows/release.yml` workflow builds, zips, attaches the
zip to a GitHub Release, and (if the `EXTENSION_ID_<PLUGIN>` secret
is configured) auto-uploads to the Chrome Web Store.

After first publishing each plugin, set `webStoreUrl` on its entry in
`packages/core/src/family.ts` so siblings cross-promote it with an
active "Open" button.

## Permissions and privacy

Each extension declares the minimum necessary set:

- `storage` — persist saved searches, settings, and (LinkedIn only)
  saved companies/people locally.
- `sidePanel` — drive the side-panel display mode.

The LinkedIn plugin additionally declares two LinkedIn-specific
capabilities to power its **"From current tab"** company-and-person
capture feature:

- `host_permissions: ["*://*.linkedin.com/*"]` — scoped to LinkedIn
  only. Grants the extension permission to read tab URLs and run
  user-triggered scripts on `linkedin.com` tabs. **No non-LinkedIn
  tab data is ever visible** to the extension. (We tried `activeTab`
  first; it was unreliable in side-panel mode because every navigation
  inside the LinkedIn tab ended the temporary grant.)
- `scripting` — paired with the host permission to inject a
  single-purpose regex-match function (`/urn:li:fsd_company:(\d+)/` or
  `/(?:urn:li:fsd_profile:|/in/)(ACoA[A-Za-z0-9_-]{20,})/`) into the
  rendered HTML of `linkedin.com/company/<slug>/` or
  `linkedin.com/in/<vanity>/` pages on user click. The function runs
  once per click, returns only the matched ID/token, and reads nothing
  else.

The other 6 plugins (GitHub, X, YouTube, Reddit, Hugging Face, Hacker
News) declare **no** tab/host/scripting permissions. They only call
`chrome.tabs.create()` to open generated URLs, which requires no
permission at all.

None of the plugins hit platform APIs, run content scripts on page
load, send data to remote servers, or read cookies. All data lives
in `chrome.storage.local` (this device only) and never leaves your
machine. Backup/restore is JSON file-based; the export is written to
your disk via the browser's download mechanism, never uploaded.

Use of platform search URLs is subject to each platform's terms.
These tools are intended for manual, human-driven use; do not pair
them with scraping or automation.

## Status and caveats

### LinkedIn
- All four search verticals functional: Posts, Jobs, People (no
  Newsletter — LinkedIn doesn't expose a stable URL form for it).
- Posts builder supports `postedBy` chips (1st-degree / People I follow
  / **Me**), `fromOrganization` (company), `fromMember` (person — uses
  the opaque `ACoAA…` profile token, not the legacy numeric URN),
  `mentionsOrganization`, `mentionsMember`, and a Content type filter
  (`videos` / `photos` / `documents`).
- Jobs builder: `f_TPR` recency, `f_F` job functions, `f_VJ` "Has
  verifications," `f_AL` "Under 10 applicants," `f_JIYN` "In your
  network," `f_C` companies, `f_WT` workplace, `f_E` experience level,
  `f_JT` job type, `f_EA` Easy Apply.
- People builder: Industry typeahead, current/past companies via
  saved-entity chips, network degree, title free text.
- The "Me" chip is gated on capturing your own profile token in
  Settings → Your LinkedIn profile (one-click via `linkedin.com/me/`
  redirect or paste of your vanity).
- All facet-tagged searches emit `origin=FACETED_SEARCH` /
  `origin=JOB_SEARCH_PAGE_JOB_FILTER` — matches LinkedIn's UI
  behavior; without it certain filter combinations get dropped.
- Some parameters are documented only by empirical observation and
  marked **Beta** in the UI; LinkedIn may rename them without notice.
- LinkedIn's content search has no past-hour date filter — smallest
  posts window is past-24h.
- Mobile LinkedIn ignores most of these parameters — desktop only.

### GitHub
- Templates and builders functional across Repositories / Code /
  Issues / Pull Requests / Users.
- All qualifier emission unit-tested. `qualifier()` auto-quotes
  whitespace values (e.g. `location:"San Francisco"`).
- Boolean qualifiers like `archived` and `draft` only emit when the
  field is explicitly `true` or `false` (undefined skips them).

### X
- Single form with mode tabs (Top / Latest / People / Media).
  Operator emission unit-tested, including hashtag/mention prefix
  normalization (a leading `#` or `@` is stripped if the user
  includes it).
- Zero-valued engagement floors (`min_faves:0` etc.) are omitted from
  the query.
- Boolean helper shared from `@toolkit/core`; operators (AND / OR /
  NOT / quotes) apply identically across all 7 plugins.

### YouTube, Reddit, Hugging Face, Hacker News
- See each plugin's README for plugin-specific details and any beta
  caveats. All four use the same Templates/Builder/Saved/Settings
  shape as the others; differences are in the URL families and
  parameter sets.

See `documents/Requirements.md` for full scope, future-extension hooks,
and the original parameter catalog.
