# X Search Toolkit (Unofficial)

A Chrome extension that composes X (formerly Twitter) advanced search
URLs and opens them in a new tab — no scraping, no API calls. Pure URL
construction with operator helpers (`from:`, `since:`, `min_faves:`,
`filter:images`, etc.).

> **Unofficial.** Independent third-party tool. Not affiliated with, endorsed by, or sponsored by X Corp.

---

## Install / Run

```bash
npm install                       # at the monorepo root
npm run build -w @toolkit/x-extension
```

Then in Chrome → `chrome://extensions` → enable Developer mode → **Load
unpacked** → select `packages/x/dist/`.

For development with HMR:

```bash
npm run dev -w @toolkit/x-extension
```

---

## How to use

The popup has five views (bottom navigation):

1. **Templates** — one-click recipes. Each card has **Open** (primary,
   left — labeled **Open as-is** when the template carries hardcoded
   placeholder values) and **Customize** (loads the template into the
   Builder for tuning before opening).
2. **Builder** — a single search form with a mode tab strip at the top
   (Top / Latest / People / Media) that maps to X's `f=` URL parameter.
   The form groups operators into People, Content, Date range,
   Engagement floors, Filters, and List ID. The Save dialog detects
   when the same URL is already saved and offers a one-click **Update X
   instead**; editing an existing entry overwrites it in place.
3. **Saved** — your library of saved searches. Open, Edit, Duplicate,
   Delete. Filter by name or tag.
4. **Settings** — theme, display mode, default mode, JSON
   backup/restore.
5. **About** — what this is, privacy, sibling extensions.

### Open mode

- **Side panel** (default) — stays open while you browse x.com.
- **Popup** — classic toolbar window; closes on outside click.

### Boolean helper

Above the keywords field is a **Boolean helper** button. Inserts
`AND` / `OR` / `NOT`, parentheses, quoted phrases — same primitive
used by the LinkedIn toolkit.

---

## Built-in templates

Eight templates, grouped by intent (spot-check sample below — see
`src/lib/templates.ts` for the full list):

### Customizable searches

| Title | What it does |
| --- | --- |
| **Latest from a user** | Newest posts from a specific account (`from:elonmusk`, mode Latest). Customize username. |
| **Hashtag pulse** | Latest posts for a hashtag (`#AIagents`, mode Latest). Set a `since:` date in Customize to limit recency. |
| **High-engagement on a topic** | Top posts above an engagement floor (`AI agents min_faves:1000 lang:en`, mode Top). Customize topic and threshold. |
| **From a list — latest** | Latest posts from an X list (`list:<id>`, mode Latest). Replace the list ID with your own — find it in the URL when viewing a list on x.com. |
| **Posts with media from a user** | Image posts from a user (`from:NASA filter:images`, mode Latest). Customize username. |
| **Find people on X** | People-search for accounts matching a phrase (`climate scientist`, mode People). Customize the phrase. |

### Direct URLs (no search)

| Title | What it does |
| --- | --- |
| **Bookmarks** | `x.com/i/bookmarks` — opens your bookmarks (login required). |

---

## Builder operators

The form covers the high-value subset of X's advanced-search operators:

### Mode tabs (drives `f=` URL parameter)

- **Top** (default) — no `f` parameter
- **Latest** — `f=live`
- **People** — `f=user`
- **Media** — `f=image`

### People

- `fromUser` → `from:<user>`
- `toUser` → `to:<user>`
- `mentioning` → `@<user>`

The `@` is auto-stripped if you include it; same for `#` on hashtag.

### Content

- `keywords` — free text, joined into the query as-is
- `hashtag` → `#<tag>`
- `language` → `lang:<code>` (e.g. `en`, `es`, `fr`, `ja`)

### Date range

- `since` (YYYY-MM-DD) → `since:<date>`
- `until` (YYYY-MM-DD) → `until:<date>`

### Engagement floors

- `minFaves` → `min_faves:<n>`
- `minRetweets` → `min_retweets:<n>`
- `minReplies` → `min_replies:<n>`

Zero-valued floors are omitted from the query.

### Filters

- `filterReplies` → `include` (no qualifier) / `only` (`filter:replies`)
  / `exclude` (`-filter:replies`)
- `filterMedia` → `any` (no qualifier) / `images` (`filter:images`)
  / `videos` (`filter:videos`) / `links` (`filter:links`)
- `verifiedOnly` → `filter:verified`

### List

- `list` → `list:<id>` (numeric list ID — find it in `x.com/i/lists/<id>`)

---

## What this extension does **not** do

- **No scraping.** The extension never reads or modifies x.com pages.
  No `host_permissions`, no content scripts.
- **No API calls.** Doesn't hit the X v2 API or any internal endpoints.
- **No data leaves your machine.** All saved searches and settings live
  in `chrome.storage.local`.

---

## Backup / Restore

Settings → Backup → **Export JSON** / **Import JSON**. A strict
pre-import gate rejects backup files with unsupported settings values
before any storage write.

---

## Adding a built-in template

1. Open `packages/x/src/lib/templates.ts`.
2. Add an entry to `BUILTIN_TEMPLATES` with a unique `id`, `title`,
   `description`, and a `search: SearchInput` payload (a `'search'`
   branch with `XSearchInput`, or `{ type: 'special', url }` for direct
   URLs).
3. Run `npm test -w @toolkit/x-extension` — the suite verifies every
   template produces a valid `x.com` URL and that all IDs are unique.

---

## Project structure

```
packages/x/
├── src/
│   ├── manifest.json
│   ├── background/service-worker.ts — popup-vs-sidepanel toggle
│   ├── lib/
│   │   ├── url-builder/             — XSearchInput → URL
│   │   ├── params.ts                — UI options for selects
│   │   └── templates.ts             — built-in template list
│   └── popup/
│       ├── App.svelte
│       ├── components/              — form + list components
│       ├── stores/                  — builder / saved / settings
│       └── views/                   — Templates / Builder / Saved / Settings
├── tests/                           — vitest suite (23 tests)
└── ...                              — vite/tailwind/svelte configs
```

Shared UI primitives live in `packages/core` and are imported via
`@toolkit/core`.

---

## Privacy & ToS

This extension only generates X search URLs and opens them in your
browser. It does not scrape, automate, or read content from x.com. Use
at your own discretion and per X's Terms of Service.
