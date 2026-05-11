# GitHub Search Toolkit (Unofficial)

A Chrome extension that composes GitHub search URLs and opens them in
a new tab — no scraping, no API calls. Pure URL construction with
qualifier helpers (`language:`, `stars:`, `is:open`, etc.).

> **Unofficial.** Independent third-party tool. Not affiliated with, endorsed by, or sponsored by GitHub, Inc. or Microsoft.

---

## Install / Run

```bash
npm install                       # at the monorepo root
npm run build -w @toolkit/github-extension
```

Then in Chrome → `chrome://extensions` → enable Developer mode → **Load
unpacked** → select `packages/github/dist/`.

For development with HMR:

```bash
npm run dev -w @toolkit/github-extension     # vite dev server
```

---

## How to use

The popup has five views (bottom navigation):

1. **Templates** — one-click recipes. Each card has **Open** (primary,
   left — launches the URL immediately, labeled **Open as-is** when the
   template carries hardcoded placeholder values) and **Customize**
   (loads the template into the Builder for tuning before opening).
2. **Builder** — five tabs (Repositories / Code / Issues / Pull Requests
   / Users), each with a typed form for the high-value qualifiers on
   that search type. Live URL preview at the bottom; **Open**, **Copy**,
   and **Save** sit beneath it. The Save dialog detects when the same
   URL is already saved and offers a one-click **Update X instead**;
   editing an existing saved entry overwrites it in place.
3. **Saved** — your library of saved searches. Open, Edit, Duplicate,
   Delete. Filter by name or tag.
4. **Settings** — theme, display mode (popup vs side panel), defaults,
   JSON backup/restore.
5. **About** — what this is, privacy, sibling extensions.

### Open mode

- **Side panel** (default) — stays open while you browse GitHub.
- **Popup** — classic toolbar window; closes on outside click.

Toggle in Settings → "Open as." Takes effect the next time you click
the toolbar icon.

### Boolean helper

Above every keyword field is a **Boolean helper** button. Inserts
`AND` / `OR` / `NOT`, parentheses, quoted phrases, and shows worked
examples — same primitive used by the LinkedIn toolkit.

---

## Built-in templates

14 templates, grouped by intent (spot-check sample below — see
`src/lib/templates.ts` for the full list):

### "Inbox" templates (special URLs)

| Title | What it does |
| --- | --- |
| **Trending — TypeScript, today** | `github.com/trending/typescript?since=daily` |
| **Trending — Python, this week** | `github.com/trending/python?since=weekly` |
| **PRs awaiting my review** | `github.com/pulls/review-requested` — your review queue. |
| **Issues assigned to me** | `github.com/issues/assigned` |
| **Issues mentioning me** | `github.com/issues/mentioned` |

### Customizable searches

| Title | What it does |
| --- | --- |
| **Top repos in a language** | Repositories search: `language:rust stars:>10000 sort:stars`. Customize language and threshold. |
| **Recent code in an org** | Code search: `user:YourOrg TODO`. Customize org and keyword. |
| **Open PRs in a repo** | Pull-request search: `repo:owner/name is:pr is:open`. Customize repo. |
| **Find users by location and language** | User search: `location:"San Francisco" language:rust`. Customize before opening. |

---

## Builder fields (per search type)

The Builder forms expose a deliberately tight subset of GitHub's
qualifier vocabulary — the high-value ones, not every flag.

### Repositories

`keywords`, `user`, `language`, `stars` (e.g. `>1000`, `100..500`),
`forks`, `pushed` (e.g. `>2024-01-01`), `archived` (boolean),
`sort` (stars / forks / updated).

### Code

`keywords`, `user`, `repo` (full `owner/name`), `language`, `path`,
`extension`, `inFile`, `inPath`.

### Issues

`keywords`, `repo`, `user`, `state` (open / closed), `author`,
`assignee`, `label`, `created`, `sort` (created / updated / comments).
`is:issue` is implicit.

### Pull Requests

Same as Issues plus `reviewRequested` (e.g. `@me` or a username) and
`draft` (boolean). `is:pr` is implicit.

### Users

`keywords`, `location`, `language`, `followers`, `repos`,
`type` (user / org).

---

## What this extension does **not** do

- **No scraping.** The extension never reads or modifies github.com
  pages. No `host_permissions`, no content scripts.
- **No API calls.** Doesn't hit the GitHub REST or GraphQL APIs. No
  tokens, no rate-limit concerns.
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

1. Open `packages/github/src/lib/templates.ts`.
2. Add an entry to `BUILTIN_TEMPLATES` with a unique `id`, `title`,
   `description`, and a `search: SearchInput` payload (one of the
   typed branches, or `{ type: 'special', url }` for inbox-style URLs).
3. Run `npm test -w @toolkit/github-extension` — the suite verifies
   every template produces a valid `github.com` URL and that all IDs
   are unique.

---

## Project structure

```
packages/github/
├── src/
│   ├── manifest.json
│   ├── background/service-worker.ts — popup-vs-sidepanel toggle
│   ├── lib/
│   │   ├── url-builder/             — typed URL builders per search type
│   │   ├── params.ts                — UI options for selects
│   │   └── templates.ts             — built-in template list
│   └── popup/
│       ├── App.svelte
│       ├── components/              — form + list components
│       ├── stores/                  — builder / saved / settings
│       └── views/                   — Templates / Builder / Saved / Settings
├── tests/                           — vitest suite (29 tests)
└── ...                              — vite/tailwind/svelte configs
```

Shared UI primitives (Tabs, Toggle, ChipGroup, Select, BooleanHelper,
KeywordsField, FamilyCard, FamilySection) live in `packages/core` and
are imported via `@toolkit/core`.

---

## Privacy & ToS

This extension only generates GitHub URLs and opens them in your
browser. It does not scrape, automate, or read content from GitHub.
Use at your own discretion and per GitHub's Terms of Service.
