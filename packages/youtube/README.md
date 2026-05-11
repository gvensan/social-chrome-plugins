# YouTube Search Toolkit

A Chrome extension that composes YouTube search URLs and opens them in
a new tab — no scraping, no automation, no API calls, no Google
account access. The extension **only generates URLs**; the user (or the
browser) does everything else.

Filtering is driven by YouTube's `sp=` parameter — an opaque
base64-protobuf token. We don't reverse-engineer it; the extension
ships a curated set of community-known `sp=` values that map to common
filter combinations (recency, duration, type, sort, quality).

---

## Install / Run

```bash
npm install                       # at the monorepo root
npm run build:youtube             # produces packages/youtube/dist/
```

Then in Chrome → `chrome://extensions` → enable Developer mode → **Load
unpacked** → select `packages/youtube/dist/`.

For development with HMR:

```bash
npm run dev:youtube               # vite dev server
```

---

## How to use

The popup has five views (bottom navigation):

1. **Templates** — one-click recipes grouped by intent (Personal /
   Channels / By topic). Each card has **Open** (primary, left —
   labeled **Open as-is** when the template carries hardcoded
   placeholder values) and **Customize** (loads the template into the
   Builder for tuning before opening).
2. **Builder** — a single form: a keywords field plus a filter-preset
   Select. A live URL preview updates on every keystroke; **Open**,
   **Copy**, and **Save** sit beneath it. The Save dialog detects when
   the same URL is already saved and offers a one-click **Update X
   instead**; editing an existing saved entry overwrites it in place.
3. **Saved** — your library of saved searches. Open, Edit, Duplicate,
   Delete. Filter by name or tag.
4. **Settings** — theme, display mode (popup vs side panel), defaults,
   JSON backup/restore.
5. **About** — what this is, privacy, sibling extensions.

### Open mode

- **Side panel** (default) — stays open while you browse YouTube.
- **Popup** — classic toolbar window; closes on outside click.

Toggle in Settings → "Open as." Takes effect the next time you click
the toolbar icon.

---

## The Builder

Two inputs, mapped to YouTube's URL shape:

| Field | URL output | Notes |
| --- | --- | --- |
| Keywords | `search_query=…` | Free text. Supports YouTube's own operators (`"quoted phrase"`, `-exclude`, etc.) — passed through verbatim. |
| Filter preset | `sp=<token>` | Selects from a curated set of known `sp=` tokens (recency, duration, type, sort, quality). Omitted when "No filter". |

### Available presets

Recency: **Today**, **This week**, **This month**, **This year**.
Sort: **Sort by upload date**, **Sort by view count**, **Sort by
rating**. Duration: **Short (<4 min)**, **Long (>20 min)**. Quality:
**HD / 4K only**, **Has subtitles**, **Creative Commons license**.
Type: **Channels**, **Playlists**, **Movies**.

> `sp=` is undocumented. If YouTube ever changes a token, the URL still
> loads, but the filter behavior may degrade — values may need
> refreshing in `src/lib/url-builder/encode.ts`.

---

## Built-in templates

8 templates across 3 groups:

### Personal
- **Trending** — `youtube.com/feed/trending`.
- **My subscriptions** — subscription feed (login required).

### Channels
- **Find a channel** — Channels tab search. Customize the channel name.

### By topic
- **Latest tutorials on a topic** — sort by upload date. Customize the
  keyword.
- **This week on a topic** — uploads in the last 7 days. Customize the
  keyword.
- **Long-form deep dives** — videos >20 minutes. Customize the keyword.
- **Top this month** — sort by view count. Customize the keyword.
- **HD content this month** — HD/4K videos. Customize the keyword.

---

## What this extension does **not** do

- **No background scraping.** No content scripts, no scheduled reads,
  no fetches against YouTube endpoints. The extension declares no
  `host_permissions` for `youtube.com`.
- **No automation.** No clicks, no API calls, no programmatic navigation.
- **No Google account access.** No OAuth, no YouTube Data API, no
  tokens.
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

1. Open `packages/youtube/src/lib/templates.ts`.
2. Add an entry to `BUILTIN_TEMPLATES` with a unique `id`, a short
   `title`, a `description`, a `group`, and a `search: SearchInput`
   payload (a `'search'` branch with `YouTubeSearchInput`, or
   `{ type: 'special', url }` for direct URLs like the trending feed).
3. Run `npm test -w @toolkit/youtube-extension` — the suite verifies
   every template produces a valid `youtube.com` URL and that all IDs
   are unique.

---

## Project structure

```
packages/youtube/
├── src/
│   ├── manifest.json                — MV3 manifest
│   ├── background/service-worker.ts — popup-vs-sidepanel toggle
│   ├── lib/
│   │   ├── url-builder/             — YouTubeSearchInput → URL
│   │   ├── params.ts                — UI options for the preset Select
│   │   ├── templates.ts             — built-in template list
│   │   └── template-preview.ts      — pretty-print a SearchInput
│   └── popup/
│       ├── App.svelte               — root component, view router
│       ├── components/              — form + list components
│       ├── stores/                  — builder / saved / settings
│       └── views/                   — Templates / Builder / Saved / Settings / About
├── tests/                           — vitest suite (44 tests)
├── public/icons/                    — toolbar/store icons
├── package.json
├── vite.config.ts
└── tsconfig.json
```

Shared UI primitives (KeywordsField, Select, SaveSearchDialog,
SavedSearchRow, FamilySection, CollapsibleSection) live in
`packages/core` and are imported via `@toolkit/core`. The per-plugin
`stores/saved.svelte.ts` is a 4-line shim over
`@toolkit/core/SavedSearchesStore`.

---

## Privacy & ToS

This extension only generates YouTube URLs and opens them in your
browser. It does not scrape, automate, or read content from
youtube.com. It is an unofficial third-party tool, not affiliated with
youtube.com or Google. Use at your own discretion and per YouTube's
Terms of Service.
