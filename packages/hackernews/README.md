# Hacker News Search Toolkit

A Chrome extension that composes Hacker News search URLs (powered by
the Algolia HN search at `hn.algolia.com`) and opens them in a new tab
— no scraping, no automation, no API calls. The extension **only
generates URLs**; the user (or the browser) does everything else.

---

## Install / Run

```bash
npm install                       # at the monorepo root
npm run build:hackernews          # produces packages/hackernews/dist/
```

Then in Chrome → `chrome://extensions` → enable Developer mode → **Load
unpacked** → select `packages/hackernews/dist/`.

For development with HMR:

```bash
npm run dev:hackernews            # vite dev server on :5182
```

---

## How to use

The popup has five views (bottom navigation):

1. **Templates** — one-click recipes (Live / Posts / Topics / Authors).
2. **Builder** — single form covering every Algolia HN search parameter
   in one place. The Save dialog detects when the same URL is already
   saved and offers a one-click **Update X instead**; editing an
   existing saved entry overwrites it in place.
3. **Saved** — your library of saved searches with tag filters.
4. **Settings** — theme, display mode, defaults, JSON backup/restore.
5. **About** — privacy, sibling extensions.

### Open mode

- **Side panel** (default) — stays open while you read HN.
- **Popup** — classic toolbar window; closes on outside click.

---

## The Builder

A single search form covering every Algolia HN search parameter:

| Field | Param | Notes |
| --- | --- | --- |
| Free text | `query=` | Searches title and body. |
| Type | `type=` | all / story / comment / ask_hn / show_hn / poll / job |
| Sort | `sort=` | byPopularity (default) or byDate |
| Date range | `dateRange=` | all / last24h / pastWeek / pastMonth / pastYear / custom |
| Custom start/end | `dateStart=`, `dateEnd=` | epoch seconds; activates only when dateRange=custom |
| Author | `author=` | HN username (leading @ stripped) |
| Story id | `storyId=` | scopes comments to a single thread |
| Min points | `numericFilters=points>=N` | engagement floor for stories |
| Min comments | `numericFilters=num_comments>=N` | discussion floor |
| Exact match | `prefix=false` | disables prefix matching for stricter results |

Both engagement floors compose into a single `numericFilters=` value
when set.

---

## Built-in templates

9 templates across 4 groups:

### Live
- **Front page right now** — `news.ycombinator.com/news`.
- **Newest submissions** — `news.ycombinator.com/newest`.

### Posts
- **Show HN — past week** — `type=show_hn + dateRange=pastWeek + sort=byPopularity`.
- **Ask HN — past week** — same with `type=ask_hn`.

### Topics
- **Top stories on a topic — past month** — keyword + `type=story + dateRange=pastMonth + sort=byPopularity`.
- **500-point threads this year** — `type=story + dateRange=pastYear + minPoints=500`. Surfaces the year's genuinely-big discussions.
- **High-engagement threads — past month** — `type=story + dateRange=pastMonth + minComments=100`. Finds debates, not just upvotes.

### Authors
- **Author's stories — newest first** — `author=<u> + type=story + sort=byDate`.
- **Author's comments — newest first** — `author=<u> + type=comment + sort=byDate`.

---

## What this extension does **not** do

- **No background scraping.** No content scripts, no scheduled reads,
  no fetches against HN or Algolia endpoints.
- **No automation.** No clicks, no API calls, no programmatic navigation.
- **No data leaves your machine.** All saved searches and settings live
  in `chrome.storage.local`.

---

## Backup / Restore

Settings → Backup → **Export JSON** writes everything the extension
stores to a downloadable file. **Import JSON** reads such a file back.
Backup files with unsupported settings values are rejected by a strict
pre-import gate before any storage write — a corrupt backup can't
clobber your saved searches.

---

## Adding a built-in template

1. Open `packages/hackernews/src/lib/templates.ts`.
2. Add an entry to `BUILTIN_TEMPLATES` with a unique `id`, a short
   `title`, a `description`, a `group`, and a `search: SearchInput`.
3. Run `npm test -w @toolkit/hackernews-extension` — the suite verifies
   every template produces a valid HN-host URL and IDs are unique.

---

## Project structure

```
packages/hackernews/
├── src/
│   ├── manifest.json                — MV3 manifest
│   ├── background/service-worker.ts — popup-vs-sidepanel toggle
│   ├── lib/
│   │   ├── url-builder/             — typed URL builder
│   │   ├── params.ts                — UI options for selects
│   │   ├── templates.ts             — built-in template list
│   │   └── template-preview.ts      — pretty-print a SearchInput
│   └── popup/
│       ├── App.svelte               — root component, view router
│       ├── components/              — form + list components
│       ├── stores/                  — builder / saved / settings
│       └── views/                   — Templates / Builder / Saved / Settings / About
├── tests/                           — vitest suite
├── public/icons/                    — toolbar/store icons
├── package.json
├── vite.config.ts
└── tsconfig.json
```

Shared UI primitives live in `packages/core` and are imported via
`@toolkit/core`.

---

## Privacy & ToS

This extension only generates URLs and opens them in your browser. It
does not scrape, automate, or read content from Hacker News. Use at
your own discretion and per the HN community guidelines.
