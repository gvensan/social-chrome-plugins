# Reddit Search Toolkit (Unofficial)

A Chrome extension that composes Reddit search and listing URLs and
opens them in a new tab — no scraping, no automation, no API calls. The
extension **only generates URLs**; the user (or the browser) does
everything else.

> **Unofficial.** Independent third-party tool. Not affiliated with, endorsed by, or sponsored by Reddit, Inc.

---

## Install / Run

```bash
npm install                      # at the monorepo root
npm run build:reddit             # produces packages/reddit/dist/
```

Then in Chrome → `chrome://extensions` → enable Developer mode → **Load
unpacked** → select `packages/reddit/dist/`.

For development with HMR:

```bash
npm run dev:reddit               # vite dev server on :5180
```

---

## How to use

The popup has five views (bottom navigation):

1. **Templates** — one-click recipes grouped by intent (Personal /
   Listings / Topics / Scoped / Discover). Each card has **Open**
   (launches the URL immediately) and **Customize** (loads the template
   into the Builder for tuning before opening).
2. **Builder** — five tabs (**Posts** / **Comments** / **Subs** /
   **Users** / **Feed**), each with a typed form that mirrors Reddit's
   search and listing parameters. A live URL preview updates on every
   keystroke; **Open**, **Copy**, and **Save** sit beneath it. The Save
   dialog detects when the same URL is already saved and offers a
   one-click **Update X instead**; editing an existing saved entry
   overwrites it in place.
3. **Saved** — your library of saved searches. Each row supports Open,
   Edit, Duplicate, and Delete. Filter by name or tag.
4. **Settings** — theme, display mode (popup vs side panel), defaults,
   JSON backup/restore.
5. **About** — what this is, privacy, sibling extensions.

### Open mode

- **Side panel** (default) — stays open while you browse Reddit. Best
  for iterating on a search and re-launching without re-opening the
  toolkit.
- **Popup** — classic toolbar window; closes on outside click. Lighter
  for one-shot launches.

Toggle in Settings → "Open as." Takes effect the next time you click
the toolbar icon.

### Boolean helper

Above every keyword field is a **Boolean helper** button. It inserts
quoted phrases, `AND` / `OR` / `NOT`, parentheses, and shows worked
examples.

---

## The five Builder tabs

### Posts (`/search/?type=link`)

Composes Reddit's Lucene-style query with these qualifiers:

| Field | Qualifier emitted | Example |
| --- | --- | --- |
| Subreddit | `subreddit:<name>` | `subreddit:rust` |
| Author | `author:<name>` | `author:spez` |
| Flair | `flair:<text>` (quoted if multi-word) | `flair:"Show & Tell"` |
| Title contains | `title:<text>` | `title:release` |
| Body contains | `selftext:<text>` | `selftext:breaking` |
| Post type | `self:yes` / `self:no` | self-posts only / link-posts only |
| URL contains | `url:<text>` | `url:arxiv.org/abs` |
| Domain | `site:<domain>` | `site:github.com` |
| Sort | `sort=` | relevance / hot / top / new / comments |
| Time window | `t=` | hour / day / week / month / year / all |
| Include NSFW | `&include_over_18=on` | toggles the safe-search bypass |

Leading `r/` on subreddit and `u/` on author are stripped for you.

### Comments (`/search/?type=comment`)

Subset of the Posts qualifiers — keywords, subreddit, author, sort,
time, NSFW.

### Subreddits (`/search/?type=sr`)

Find subreddits by topic. Sort: relevance / activity. NSFW toggle.

### Users (`/search/?type=user`)

Find users by handle substring. Sort: relevance / activity.

### Feed (listing URLs)

Composes a listing URL — the URL shape changes based on the target:

| Target | URL shape |
| --- | --- |
| Single subreddit | `/r/<sub>/<sort>/?t=<time>` |
| Multireddit (multiple subs) | `/r/<sub1>+<sub2>+<sub3>/<sort>/?t=<time>` |
| Global (`r/all` or `r/popular`) | `/r/<scope>/<sort>/?t=<time>` |
| User submissions | `/user/<u>/submitted/?sort=<sort>&t=<time>` |
| User comments | `/user/<u>/comments/?sort=<sort>&t=<time>` |

Sort: hot / new / top / rising / controversial. The `t=` parameter is
emitted only when the sort honors it (top, controversial); for hot/new/
rising it's silently dropped so the URL stays clean.

The **multireddit** form is a Reddit-only trick: a single bookmarkable
URL that aggregates content across N subreddits, sorted as a unified
feed. There's no native UI to compose one of these.

---

## Built-in templates

Currently 16 templates across 5 groups:

### Personal
- **My home feed** — your logged-in home feed.
- **My inbox** — messages and replies inbox.

### Listings
- **r/all — hot now** — Reddit-wide hot feed.
- **r/popular — top this week** — popular feed, top of the past 7 days.
- **Top all-time in a subreddit** — `top + t=all` in a single sub.
- **Rising in a subreddit** — momentum signal.
- **Multireddit — top today** — top across multiple subs at once.

### Topics
- **Top posts on a topic this week** — keyword + `sort=top + t=week`.
- **Most-discussed threads on a topic** — `sort=comments + t=month`.
- **Self-posts on a topic — newest** — `self:yes` to strip link-spam.
- **Posts linking to a domain** — `site:<domain>`. High-signal for
  monitoring how Reddit reacts to releases or articles.

### Scoped
- **Question-flair posts in a sub** — flair-filtered.
- **AMAs this week** — `subreddit:IAmA + sort=top + t=week`.
- **User's top submissions this year** — `/user/<u>/submitted/?sort=top&t=year`.
- **User's recent comments** — `/user/<u>/comments/?sort=new`.

### Discover
- **Find subreddits about a topic** — `?type=sr + sort=activity`.
- **Find users by handle** — `?type=user + sort=activity`.

---

## What this extension does **not** do

- **No background scraping.** No content scripts that run on page
  load, no scheduled or recurring reads, no fetches from any Reddit
  endpoint. The extension declares no `host_permissions` for
  `reddit.com`.
- **No automation.** No clicks, no API calls, no fetches against
  Reddit endpoints, no programmatic navigation.
- **No data leaves your machine.** All saved searches and settings live
  in `chrome.storage.local`. The Export JSON feature writes to a file
  on your disk; the extension never sends data over the network.

---

## Backup / Restore

Settings → Backup → **Export JSON** writes everything the extension
stores (saved searches, settings) to a downloadable file. **Import
JSON** reads such a file back. Useful for moving setup between machines.
Backup files with unsupported settings values are rejected by a strict
pre-import gate before any storage write — a corrupt backup can't
clobber your saved searches.

---

## Known limits / Beta caveats

- Reddit's `geo_filter=` parameter is **undocumented** and only honored
  by some listings. Treat it as best-effort.
- Time window (`t=`) is silently ignored by Reddit for `sort=hot`,
  `sort=new`, `sort=rising`, and `sort=relevance`. The Builder hides it
  in those cases to avoid confusion.
- "Find users" is a thin search — Reddit doesn't expose a rich
  user-discovery surface. Best for handle-substring matches.
- Mobile Reddit ignores some of the parameters this extension emits —
  desktop only.

---

## Adding a built-in template

1. Open `packages/reddit/src/lib/templates.ts`.
2. Add an entry to `BUILTIN_TEMPLATES` with a unique `id`, a short
   `title`, a `description`, a `group`, and a `search: SearchInput`
   payload.
3. Run `npm test -w @toolkit/reddit-extension` — the suite verifies
   every template produces a valid `reddit.com` URL and that all IDs
   are unique.

---

## Project structure

```
packages/reddit/
├── src/
│   ├── manifest.json                — MV3 manifest
│   ├── background/service-worker.ts — popup-vs-sidepanel toggle
│   ├── lib/
│   │   ├── url-builder/             — typed URL builders per search type
│   │   ├── params.ts                — UI options for selects + chips
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

Shared UI primitives (Tabs, Toggle, ChipGroup, Select, BooleanHelper,
KeywordsField, FamilySection, CollapsibleSection) live in
`packages/core` and are imported via `@toolkit/core`.

---

## Privacy & ToS

This extension only generates Reddit URLs and opens them in your
browser. It does not scrape, automate, or read content from Reddit.
Use at your own discretion and per Reddit's User Agreement.
