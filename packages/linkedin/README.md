# LinkedIn Feed Toolkit

A Chrome extension that composes LinkedIn search URLs and opens them in
a new tab — no scraping, no automation, no API calls. The extension
**only generates URLs**; the user (or the browser) does everything else.

---

## Install / Run

```bash
npm install                       # at the monorepo root
npm run build:linkedin            # produces packages/linkedin/dist/
```

Then in Chrome → `chrome://extensions` → enable Developer mode → **Load
unpacked** → select `packages/linkedin/dist/`.

For development with HMR:

```bash
npm run dev:linkedin              # vite dev server
```

---

## How to use

The popup has six views (bottom navigation):

1. **Templates** — one-click recipes. Each card has **Open** (primary,
   launches the URL immediately) and **Customize** (secondary, loads the
   template into the Builder for tuning). Templates with hardcoded
   placeholder values (keywords, person, etc.) are flagged with a
   "Setup needed" chip and labeled **Open as-is** to nudge customization
   first.
2. **Builder** — three tabs (Posts / Jobs / People), each with a typed
   form that mirrors LinkedIn's filters. A live URL preview updates on
   every keystroke; **Open**, **Copy**, and **Save** sit beneath it.
   When you load a template via Customize, a banner shows what you're
   customizing; same banner shows when editing a saved entry — clicking
   Save in that state updates the entry in place.
3. **Saved** — your library of saved searches. Each row supports Open,
   Edit, Duplicate, Delete. Filter by name or tag. Saving a search whose
   URL already matches an existing entry shows an amber "Already saved
   as 'X'" hint with a one-click "Update X instead" pivot button.
4. **Filters** — sub-tabbed Companies and People stores. Save once with
   a friendly label, then pick as chips in the Builder.
5. **Settings** — theme, display mode (popup vs side panel), open
   mode (current tab vs new tab), default search type / landing view /
   recency, **Your LinkedIn profile** capture (enables the "Me" chip),
   JSON backup/restore.
6. **About** — version, links, cross-promotion to sibling toolkits.

### Open mode

- **Side panel** (default) — stays open while you browse LinkedIn. Best
  for iterating on a search and re-launching without re-opening the
  toolkit.
- **Popup** — classic toolbar window; closes on outside click. Lighter
  for one-shot launches.

Toggle in Settings → "Open as." Takes effect the next time you click
the toolbar icon.

### Boolean helper

Above every keyword field is a **Boolean helper** button. It inserts
quoted phrases, `AND` / `OR` / `NOT`, parentheses, and shows worked
examples. Operators must be uppercase to be honored by LinkedIn — the
helper does this for you.

---

## Built-in templates

Templates with hardcoded placeholders (keywords, title, person, etc.)
are tagged `requiresCustomize` — the card shows "Setup needed" and
nudges you to Customize before opening.

### Posts

| Title | What it does |
| --- | --- |
| **Network feed — past 24h** | Latest posts from your 1st connections + people you follow. Sort: latest. |
| **Latest posts from a company** | (Setup needed) Latest posts from a specific company's LinkedIn page. Pick a saved company under "From a company." |
| **Latest posts from a person** | (Setup needed) Latest posts authored by a specific individual. Save the person via Filters → People → "From current tab," then pick them under "From a person." |
| **Search posts — past week** | (Setup needed) Keyword / hashtag / company-name search across posts in the last week. Customize the keyword before opening. |

### Jobs

| Title | What it does |
| --- | --- |
| **Live job pulse — past 15 min** | Newest postings only — refresh to monitor a target search. Customize keywords/filters before opening. |
| **Fresh remote + Easy Apply — past hour** | Remote-only, Easy Apply, posted in the past hour. For fast applying. |
| **Under 10 applicants + in your network — past week** | Fresh jobs with fewer than 10 applicants at companies where you have a network connection — early-mover positioning. |
| **Jobs at a company** | (Setup needed) All open jobs at a specific company. |
| **Jobs at a company — in your network** | (Setup needed) Open jobs at a company where you have a 1st-degree connection. The "warm-application" template. |
| **Recent jobs at a company — past week** | (Setup needed) Last 7 days of jobs at a specific company. |

### People

| Title | What it does |
| --- | --- |
| **People — by title in your network** | (Setup needed) 1st + 2nd connections by title (e.g. `recruiter`, `engineering manager`, `founder`). Customize the title. |
| **People at a company — in your network** | (Setup needed) Find current and past employees of a saved company in your 1st + 2nd network. Pick the company under both "Currently at" and "Previously at" for current-or-past coverage. |

Templates marked **Beta** in the UI depend on URL parameters LinkedIn
hasn't officially documented. The toolkit emits the exact param shapes
observed in LinkedIn's own UI generation; LinkedIn may rename them
without notice.

---

## Saved companies

LinkedIn's search filters companies by **numeric company ID**, not by
name. Filters → **Companies** lets you save companies once with a
friendly label, then pick them as chips in the Builder under
**Currently at** / **Previously at** (People search) or
**From a company** / **Mentions a company** (Posts search).

### What to paste

| Format | Example | Result |
| --- | --- | --- |
| Raw numeric ID | `1234567` | ID-backed entry (precise filter) |
| URN | `urn:li:fsd_company:1234567` | ID-backed entry |
| Sales Navigator URL | `linkedin.com/sales/company/1234567/...` | ID-backed entry |
| Search URL with company filter applied | `.../people/?currentCompany=%5B%221234567%22%5D` | ID-backed entry |
| Plain company URL | `linkedin.com/company/solace/` | Slug-only fallback (keyword filter) — *unless* you click "From current tab" while on the page, see below |
| Bare company name | `Solace` | Keyword-match entry |

### "From current tab" — one-click capture

The **From current tab** button reads the URL of the active LinkedIn
tab and tries to recover the numeric ID. Shows a spinner + "Capturing…"
status while it runs. The flow:

1. Open a LinkedIn company page (`linkedin.com/company/<slug>/`), a
   Sales Nav company page, or any LinkedIn People search with the
   "Current company" filter applied.
2. Open the toolkit side panel and go to Filters → Companies.
3. Click **From current tab**.

Behind the scenes:

- If the URL itself contains the numeric ID (Sales Nav, search URL,
  URN), it's parsed directly.
- If the URL is `linkedin.com/company/<slug>/` (slug only), the
  extension scans the rendered HTML for `urn:li:fsd_company:<id>`. On
  match, you get a **hybrid** entry — saved with both the numeric ID
  and the slug.
- If the URN isn't in the page (rare), the entry falls back to
  slug-only. You can use **Get ID** later to upgrade.

Only the matched ID is read back into the extension; page HTML never
leaves the page's content world.

### Mentions a company

LinkedIn's `mentionsOrganization=["<id>"]` filter requires a numeric
company ID — there's no keyword fallback. The "Mentions a company"
picker in Posts only lists ID-backed companies; slug-only entries
won't appear. Click **Get ID** on a slug-only entry in Filters to make
it eligible.

---

## Saved people

The Filters tab also has a **People** sub-tab. Used in Posts search
via `fromMember=["<token>"]` (LinkedIn's filter for posts by a
specific author). LinkedIn migrated away from numeric member URNs to
an opaque **profile token** (e.g. `ACoAAABoeysBTY3vTs8r0yrVtG3s9NapWhiLs7U`)
— that's what the toolkit captures and emits today.

### What to paste / capture

| Format | Example | Result |
| --- | --- | --- |
| Public profile URL | `linkedin.com/in/williamhgates/` | Vanity-only entry (KW); upgrade later via Get token |
| Opaque profile URL | `linkedin.com/in/ACoAAABoeys.../` | Token-backed entry (filter-precise) |
| Profile URN | `urn:li:fsd_profile:ACoAA...` | Token-backed entry |
| Raw token | `ACoAAABoeys...` | Token-backed entry |
| Legacy member URN | `urn:li:fsd_member:1234567` | Stored as legacy id (display only — no longer usable as a filter) |
| Sales Nav lead URL | `linkedin.com/sales/lead/1234567/...` | Stored as legacy id |
| Bare name | `Bill Gates` | Keyword-match entry |

The **From current tab** button auto-captures both the token and (if
present) the legacy URN by fetching the profile page with your session
cookies. **Get token** on each entry row upgrades a vanity-only entry
to token-bearing the same way.

### Picker badges in Filters → People

- **Token** (green) — filter-precise. Usable in `fromMember` /
  `mentionsMember`.
- **Legacy** (amber) — only numeric URN captured. Not usable as a
  filter today; display only. Add the profile URL via Add-a-person to
  upgrade.
- **KW** (gray) — vanity / name only. Falls back to keyword match in
  the Posts builder (broader, less precise).

### "Me" — filter posts to your own profile

In Settings → **Your LinkedIn profile**, click **From current tab**
(works from any LinkedIn tab — fetches `linkedin.com/me/` via your
session and follows the redirect to your own profile) or paste your
vanity and click **Resolve**. Once your profile token is captured, a
**Me** chip appears in the Posts builder's "Posted by" group.
Selecting it expands at URL-build time to
`fromMember=["<your-token>"]`. "Me" is mutually exclusive with the
network-bucket chips (1st-degree / People I follow) — LinkedIn doesn't
honor that combination.

### Use cases

**"Follow a thought leader's posts without subscribing":**
1. Open `linkedin.com/in/<vanity>/` of the person.
2. Filters → People → **From current tab**. Auto-saves with the token.
3. Builder → Posts → **From a person** → pick them → Open. URL contains
   `fromMember=["<token>"]`.
4. Bookmark the URL or "Save" inside the toolkit.

**"What did X post about climate this year?":**
1. Save the person as above.
2. Builder → Posts → pick them in **From a person** → add `climate` to
   keywords → set **Date posted** to "Past month."
3. Open. Returns just their posts mentioning "climate" in the period.

**"People at a company — current + past in network":**
1. Filters → Companies → save the company (paste, or "From current tab"
   while on the company page).
2. Builder → People → set Network to **1st** and **2nd**.
3. Select the saved company under **both** "Currently at" and
   "Previously at."
4. Open. URL contains `currentCompany=["1234567"]` and
   `pastCompany=["1234567"]`.

---

## Posts builder field reference

The Posts form composes these LinkedIn URL parameters:

| Field | URL param | Notes |
| --- | --- | --- |
| Keywords | `keywords` | Plain query; Boolean operators (AND/OR/NOT, quotes, parens) honored uppercase. |
| Sort | `sortBy=["..."]` | Array form (`["date_posted"]` / `["relevance"]`). |
| Date posted | `datePosted=["..."]` | Array form (`["past-24h"]` / `["past-week"]` / `["past-month"]`). |
| Content type | `contentType=["..."]` | Single-select. Values: `videos`, `photos`, `documents`. |
| Posted by | `postedBy=["..."]` | Multi: `first`, `following`, `me`. **"Me"** expands at build time to `fromMember=["<self-token>"]` (requires self-profile capture); UI gates the chip until that's done. |
| From a company | `fromOrganization=["<id>"]` | Saved company (ID-backed) or keyword fallback (`keywords=("Solace")`) for slug-only entries. |
| From a person | `fromMember=["<token>"]` | Saved person (token-backed) or keyword fallback for vanity-only entries. |
| Mentions a company | `mentionsOrganization=["<id>"]` | ID-backed only (no fallback). |
| Mentions a person | `mentionsMember=["<token>"]` | Token-backed only (no fallback). |
| (always when any facet set) | `origin=FACETED_SEARCH` | Matches LinkedIn's UI behavior; without it some filter combinations get dropped. |

Mutual-exclusion rules enforced by the form:
- "Me" can't coexist with "1st-degree" / "People I follow."
- Selecting any entity picker (company / person, From / Mentions)
  clears all postedBy chips, and vice-versa.

---

## Jobs builder field reference

| Field | URL param | Notes |
| --- | --- | --- |
| Keywords | `keywords` | |
| Location | `location`, `geoId` | Free-text location and (when known) geo ID. |
| Posted within | `f_TPR=r<seconds>` | Recency presets: 15min / 30min / 1h / 24h / week / month. |
| Sort | `sortBy=DD` / `R` | Latest vs Most relevant. |
| Workplace | `f_WT=1,2,3` | On-site / Hybrid / Remote. |
| Experience level | `f_E=1..6` | Intern → Executive. |
| Job type | `f_JT=F,P,C,T,I,V,O` | Full-time / Part-time / Contract / etc. |
| Job function | `f_F=<csv>` | LinkedIn function codes (e.g. `eng,it,bd`). Searchable multi-select dropdown. |
| Company | `f_C=<csv>` | From saved companies. |
| Easy Apply | `f_EA=true` | |
| Has verifications | `f_VJ=true` | |
| Under 10 applicants | `f_AL=true` | |
| In your network | `f_JIYN=true` | |
| (always when any facet set) | `origin=JOB_SEARCH_PAGE_JOB_FILTER` | |

---

## What this extension does **not** do

- **No background scraping.** No content scripts that run on page
  load, no scheduled or recurring reads, no automated polling. The
  extension declares `host_permissions` for `linkedin.com` so the
  **"From current tab"** and **"Get ID" / "Get token"** buttons can —
  on user click — either (a) regex-scan the active LinkedIn tab's HTML
  for a `urn:li:fsd_company:<id>` or `urn:li:fsd_profile:<token>`
  match, or (b) fetch the relevant `/company/<slug>/` / `/in/<vanity>/`
  / `/me/` URL with your session cookies and regex-scan the response.
  Each click triggers exactly one fetch or one DOM read; only the
  matched ID/token is kept; full HTML never leaves the page or the
  extension memory beyond the regex match.
- **No automation.** No clicks, no API calls beyond the explicit
  cookie-bearing GETs above, no programmatic navigation.
- **No non-LinkedIn data accessed.** `host_permissions` is scoped to
  `linkedin.com` only. Tab URLs from other sites are not visible to
  the extension. The toolkit cannot see your gmail/banking/etc tabs.
- **No data leaves your machine.** All saved searches, companies,
  people, and settings live in `chrome.storage.local`. The Export JSON
  feature writes to a file on your disk; the extension never sends
  data over the network.

---

## Backup / Restore

Settings → Backup → **Export JSON** writes everything the extension
stores (saved searches, saved companies, saved people, settings,
self-profile token) to a downloadable file. **Import JSON** reads such
a file back.

Restore is **replacement, not merge** — local state is wiped and the
imported payload is written in its place. To protect against malformed
files corrupting your data:

1. Core's built-in shape gate validates the file metadata and the
   `settings` / `savedSearches` shape.
2. LinkedIn's `validateBackup` validator further rejects unsupported
   enum values (e.g. an old backup with `defaultLandingView:
   "newsletters"` — a feature that no longer exists).
3. If either check fails, the import returns an error and your
   existing storage is left untouched.
4. As defense in depth, every store also clamps unsupported values to
   safe defaults at load time — so even storage that somehow ends up
   malformed can't brick the popup.

---

## Known limits / Beta caveats

- The `postedBy`, `fromMember`, `fromOrganization`, `mentionsMember`,
  `mentionsOrganization`, and `contentType` parameters in posts search
  are not officially documented by LinkedIn. The toolkit emits the
  exact shapes observed in LinkedIn's UI; LinkedIn may rename them
  without notice. Templates that depend on these are marked **Beta**.
- LinkedIn's content search has no past-hour date filter — the smallest
  posts-search window is past-24h. (Jobs search supports past-15-min.)
- Mobile LinkedIn ignores most parameters this extension emits —
  desktop only.
- The plain `linkedin.com/company/<slug>/` URL doesn't carry the
  numeric company ID; the extension surfaces inline guidance when this
  is pasted and offers a one-click capture from the page.
- The "Me" chip requires your own profile token to be captured in
  Settings; the chip is hidden until then because emitting
  `postedBy=["me"]` via URL doesn't work (LinkedIn's "Me" filter is a
  UI-only client-side facet — the toolkit reimplements it via
  `fromMember=["<your-token>"]`).
- Saved people captured before the URN→token migration appear as
  **Legacy** (amber badge) and cannot drive `fromMember` until
  re-captured (Filters → People → re-paste the profile URL or use
  "Get token").

---

## Adding a built-in template

1. Open `packages/linkedin/src/lib/templates.ts`.
2. Add an entry to `BUILTIN_TEMPLATES` with a unique `id`, a short
   `title`, a `description`, and a `search: SearchInput` payload. If
   the template has hardcoded placeholder values, set
   `requiresCustomize: true` so the card shows the "Setup needed"
   chip.
3. Run `npm run test:linkedin` — the suite verifies every template
   produces a valid `linkedin.com` URL and that all IDs are unique.

For templates depending on parameters LinkedIn may rename, set
`experimental: true` so the UI shows a **Beta** chip.

---

## Project structure

```
packages/linkedin/
├── src/
│   ├── manifest.json                — MV3 manifest (storage + sidePanel +
│   │                                  scripting + host_permissions)
│   ├── background/service-worker.ts — popup-vs-sidepanel toggle
│   ├── lib/
│   │   ├── url-builder/             — typed URL builders per search type
│   │   ├── params.ts                — UI options for selects + chips
│   │   ├── templates.ts             — built-in template list
│   │   ├── template-preview.ts      — one-line human summary per template
│   │   ├── company-parser.ts        — extract IDs / vanities / tokens from
│   │   │                              pasted URLs / URNs
│   │   └── company-page-extractor.ts — tab + tab-free fetch extractors
│   │                                   for company URN, member URN, profile
│   │                                   token, and self-profile token
│   └── popup/
│       ├── App.svelte               — root + view router
│       ├── components/              — *Form per tab, *Picker components
│       │                              (Company / Person / Industry /
│       │                              JobFunction), TemplateCard, UrlPreview
│       ├── stores/                  — builder / saved (core shim) / settings
│       │                              / companies / people
│       └── views/                   — Templates / Builder / Saved /
│                                      Companies (Filters) / Settings / About
├── tests/                           — vitest suite (url-builder +
│                                       company-parser + template snapshots)
├── public/icons/                    — toolbar/store icons
├── package.json
├── vite.config.ts
└── tsconfig.json
```

Shared infrastructure — Save dialog, Saved row, generic store class,
storage helpers, view router, the small Svelte primitives, Spinner,
EditingBanner — lives in `packages/core` and is imported via
`@toolkit/core`.

---

## Privacy & ToS

This extension only generates LinkedIn URLs and opens them in your
browser. It does not scrape, automate, or read content from LinkedIn
beyond user-initiated single-shot ID/token captures explicitly
triggered from the Filters or Settings views. Use at your own
discretion and per LinkedIn's User Agreement. Not affiliated with,
endorsed by, or sponsored by LinkedIn Corporation.
