# Hacker News Search Toolkit — Chrome Web Store Submission

Field-by-field copy-paste for the CWS Developer Dashboard submission
form. Open this alongside the dashboard and paste as you go.

Companion docs:
- [`documents/PUBLISHING.md`](../../documents/PUBLISHING.md) — full publishing playbook
- [`documents/CWS-LISTING.md`](../../documents/CWS-LISTING.md) — shared field reference

---

## Store listing tab

### Title (from manifest, read-only)

> Hacker News Search Toolkit (Unofficial)

### Summary (from manifest, read-only — 102 chars)

> Unofficial. Compose Hacker News (Algolia) search URLs with points, comments, author, and date filters.

### Description (required, 16,000 char max)

```
Hacker News Search Toolkit (Unofficial) is a Chrome extension that
helps you compose, save, and launch Hacker News search URLs from a
side panel — without scraping, automation, or API calls. The
extension only generates URLs and opens them in your existing browser
session.

═══ What it does ═══

A guided builder for the Algolia-powered Hacker News search
(hn.algolia.com): author scope, time-range bounds, story-vs-comment
scoping, and points / comments thresholds. Plus built-in templates
for Show HN, Ask HN, and high-engagement-comment hunting. A live URL
preview updates as you compose, and every search can be saved to your
local library for one-click re-use.

Note: generated URLs target hn.algolia.com (the Algolia HN search),
not news.ycombinator.com.

═══ Use cases ═══

• Show HN — past week, 100+ points: filter type=story tag=show_hn
  with `points>100` and a 7-day window — your weekly launch round-up.

• Ask HN — high-engagement threads: type=story tag=ask_hn sorted by
  number of comments — surface the conversations worth reading.

• Author scope: author=<username> sorted by date — track a specific
  commenter's or submitter's recent activity.

• Comments hunting on a topic: type=comment <keyword> with a points
  threshold — find substantive replies, not headlines.

• Date-bound retrospective: <keyword> with `created_at_i>` and
  `created_at_i<` bounds for a specific time window.

═══ What it does NOT do ═══

• No background scraping. No content scripts running on page load.
  No scheduled fetches.
• No automation. No clicks, no API calls, no scraping of
  hn.algolia.com or news.ycombinator.com.
• No data leaves your device. Saved searches and settings live in
  chrome.storage.local. The Export JSON feature writes to a file on
  your disk; nothing is sent over the network.

═══ Permissions used and why ═══

• storage: Persist user-defined saved searches, tags, and settings
  locally.
• sidePanel: Render the UI as a Chrome side panel so you can keep
  the Builder open while browsing.

═══ Privacy ═══

Full privacy policy: <YOUR_PRIVACY_POLICY_URL>

The extension declares no host permissions and runs no content
scripts. It makes no network requests other than navigating tabs to
URLs you explicitly composed.

═══ Source & support ═══

Source code: <YOUR_GITHUB_REPO_URL>
Support: <YOUR_SUPPORT_EMAIL_OR_ISSUES_URL>

Not affiliated with, endorsed by, or sponsored by Y Combinator.
```

Replace the three `<...>` placeholders before saving.

### Category

> **Productivity**

(News & Weather is also defensible since Hacker News is news-
adjacent. Productivity is the better fit because this toolkit is a
search composer, not a news reader — and the URLs it generates target
hn.algolia.com search, not the news.ycombinator.com front page.)

### Language

> **English (United States)**

---

## Graphic assets

### Store icon (required, 128×128)

Drop file: `packages/hackernews/public/icons/icon-128.png` (or
extract from `release/hackernews-v0.1.0.zip` → `icons/icon-128.png`).

Currently a 4 KB geometric placeholder. Accepted by Chrome; consider
replacing with a real branded icon later.

### Global promo video

**Leave blank.** Not required; you'd need a YouTube URL.

### Screenshots (required, 1–4 at 1280×800 or 640×400)

Take all 4 after loading `packages/hackernews/dist/` as an unpacked
extension. Suggested set in order (reviewer-friendly: each shows a
distinct feature):

1. **Templates view** — section list with one card hovered to show
   Open/Customize buttons (e.g. Show HN, Ask HN, or
   high-engagement-comments templates).
2. **Builder** — with date-range filters and an author scope
   populated, showing the assembled hn.algolia.com URL in the live
   preview at the bottom.
3. **Saved view** — 2–3 rows showing tags and the
   Open / Edit / Dup / Delete actions.
4. **Settings** — theme switch, open-mode toggle, and Export JSON
   visible.

Capture method (macOS):

```bash
# Resize side panel to ~400px width, open Cmd+Shift+5, capture
# selected window. Then resize the PNG to 1280x800 (Preview → Tools →
# Adjust Size; pad with white if the aspect doesn't match).
```

### Small promo tile (440×280)

**Leave blank** — not marked required. Add later when branding ready.

### Marquee promo tile (1400×560)

**Leave blank** — optional.

---

## Additional fields

| Field | Value |
| --- | --- |
| Official URL | **None** (default) |
| Homepage URL | Your GitHub repo URL (e.g. `https://github.com/<you>/social-chrome-plugins`) |
| Support URL | Either `https://github.com/<you>/social-chrome-plugins/issues` or `mailto:support@yourdomain.com` |
| Mature content | **Off** |
| Item support | Default visible |

---

## Privacy tab

### Single purpose

```
Generate Hacker News (Algolia HN) search URLs from a guided form and
launch them in the user's existing browser session.
```

### Permission justifications

**`storage`**
```
Persist user-defined saved searches, tags, and settings (theme,
display mode, default search type, open-mode preference) locally on
the user's device via chrome.storage.local. No data leaves the
device.
```

**`sidePanel`**
```
Render the extension UI as a Chrome side panel so users can keep the
Builder open while browsing search results. The user can switch to a
classic popup in Settings; in both modes, the same UI is rendered by
the same src/popup/index.html entry.
```

### Data handling disclosures

All answers: **No**

| Question | Answer |
| --- | --- |
| Personally identifiable information | No |
| Health information | No |
| Financial / payment information | No |
| Authentication information | No |
| Personal communications | No |
| Location | No |
| Web history | No |
| User activity | No |
| Website content | No |

Tick all three certifications:
- ☑ I do not sell or transfer user data to third parties.
- ☑ I do not use or transfer user data for purposes unrelated to my item's single purpose.
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes.

### Privacy policy URL

Host the Hacker News-specific policy (Skeleton A from
[`CWS-LISTING.md`](../../documents/CWS-LISTING.md#skeleton-a--for-6-of-7-plugins-github-x-youtube-reddit-huggingface-hackernews))
at a public HTTPS URL. The easiest path is a single-file GitHub Pages
site or a public Notion page.

Paste the URL here.

---

## Distribution tab

| Field | Value |
| --- | --- |
| Visibility | **Public** (or Unlisted for private beta) |
| Regions | All regions (default) |
| Pricing | Free |

---

## Submission flow

1. Fill Store listing → **Save draft**.
2. Fill Privacy → **Save draft**.
3. Fill Distribution → **Save draft**.
4. Top-right **"Why can't I submit?"** — Google will list any
   remaining empty required fields.
5. When clean, hit **Submit for review**. First-time review for this
   plugin is typically 1–3 days (only `storage` + `sidePanel`, no
   scripting or host permissions to manually review).

---

## After approval

Get the public listing URL from the dashboard (`Package → View in store`),
then:

1. Update `packages/core/src/family.ts` — set `webStoreUrl` for the
   `hackernews` entry.
2. Bump `packages/hackernews/src/manifest.json` version (e.g.
   `0.1.1`).
3. Tag + push: `git tag hackernews-v0.1.1 && git push --tags`. CI
   builds the patch release and uploads it (with the new family URL
   in Hacker News's own About view).
4. The OTHER 6 plugins still show `webStoreUrl: undefined` for
   Hacker News — they'll show the live link only after their next
   release. See `documents/PUBLISHING.md` §"Quick checklist for first
   publication" for the lazy-vs-eager rollout choice.
