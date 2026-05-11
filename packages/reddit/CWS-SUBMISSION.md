# Reddit Search Toolkit — Chrome Web Store Submission

Field-by-field copy-paste for the CWS Developer Dashboard submission
form. Open this alongside the dashboard and paste as you go.

Companion docs:
- [`documents/PUBLISHING.md`](../../documents/PUBLISHING.md) — full publishing playbook
- [`documents/CWS-LISTING.md`](../../documents/CWS-LISTING.md) — shared field reference

---

## Store listing tab

### Title (from manifest, read-only)

> Reddit Search Toolkit (Unofficial)

### Summary (from manifest, read-only — 124 chars)

> Unofficial. Compose, save, and launch Reddit search and listing URLs (subreddits, multireddits). Not affiliated with Reddit.

### Description (required, 16,000 char max)

```
Reddit Search Toolkit (Unofficial) is a Chrome extension that helps
you compose, save, and launch Reddit search and listing URLs from a
side panel — without scraping, automation, or API calls. The
extension only generates URLs and opens them in your existing browser
session.

═══ What it does ═══

A guided builder for Reddit's search and listing surfaces: subreddit
search, multireddit (`m/<name>`) listings, posts / comments / users /
feed search, sort-and-time combinations (top-of-week, hot, new,
controversial), and link-target search (`url:<domain>`). A live URL
preview updates as you compose, and every search can be saved to your
local library for one-click re-use.

═══ Use cases ═══

• Top of week on a subreddit: r/<sub> sort=top, t=week — your weekly
  best-of digest without leaving the side panel.

• Multireddit listing: u/<you>/m/<name> on Hot — your curated
  cross-subreddit feed.

• Comments-only search on a topic: scope=comments q=<keyword> — find
  discussion threads, not just headline posts.

• Posts that link to a domain: url:<domain> — track when a specific
  site is being shared on Reddit.

• User profile search: u/<user> scope=submitted sort=top — surface
  someone's best contributions.

═══ What it does NOT do ═══

• No background scraping. No content scripts running on page load.
  No scheduled fetches.
• No automation. No clicks, no API calls, no scraping of reddit.com.
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

Not affiliated with, endorsed by, or sponsored by Reddit, Inc.
```

Replace the three `<...>` placeholders before saving.

### Category

> **Productivity**

(Social & Communication also defensible. Productivity is the safer
pick for a search composer.)

### Language

> **English (United States)**

---

## Graphic assets

### Store icon (required, 128×128)

Drop file: `packages/reddit/public/icons/icon-128.png` (or extract
from `release/reddit-v0.1.0.zip` → `icons/icon-128.png`).

Currently a 4 KB geometric placeholder. Accepted by Chrome; consider
replacing with a real branded icon later.

### Global promo video

**Leave blank.** Not required; you'd need a YouTube URL.

### Screenshots (required, 1–5 at 1280×800 or 640×400)

Take all 5 after loading `packages/reddit/dist/` as an unpacked
extension. Suggested set in order (reviewer-friendly: each shows a
distinct feature):

1. **Templates view** — section list with one card hovered to show
   Open/Customize buttons (e.g. Top-of-Week or Multireddit
   templates).
2. **Builder → Posts** — with `q=` keyword, sort, and time filters
   set and the live URL preview visible at the bottom.
3. **Builder → Subreddits** — subreddit / multireddit composition
   showing `r/<sub>` and `u/<you>/m/<name>` URL assembly.
4. **Saved view** — 2–3 rows showing tags and the
   Open / Edit / Dup / Delete actions.
5. **Settings** — theme switch, open-mode toggle, and Export JSON
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
Generate Reddit search and listing URLs (subreddit search,
multireddit listings, posts/comments/users) and launch them in the
user's existing browser session.
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

Host the Reddit-specific policy (Skeleton A from
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
   `reddit` entry.
2. Bump `packages/reddit/src/manifest.json` version (e.g. `0.1.1`).
3. Tag + push: `git tag reddit-v0.1.1 && git push --tags`. CI builds
   the patch release and uploads it (with the new family URL in
   Reddit's own About view).
4. The OTHER 6 plugins still show `webStoreUrl: undefined` for
   Reddit — they'll show the live link only after their next
   release. See `documents/PUBLISHING.md` §"Quick checklist for first
   publication" for the lazy-vs-eager rollout choice.
