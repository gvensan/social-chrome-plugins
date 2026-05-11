# X Search Toolkit — Chrome Web Store Submission

Field-by-field copy-paste for the CWS Developer Dashboard submission
form. Open this alongside the dashboard and paste as you go.

Companion docs:
- [`documents/PUBLISHING.md`](../../documents/PUBLISHING.md) — full publishing playbook
- [`documents/CWS-LISTING.md`](../../documents/CWS-LISTING.md) — shared field reference

---

## Store listing tab

### Title (from manifest, read-only)

> X Search Toolkit (Unofficial)

### Summary (from manifest, read-only — 108 chars)

> Unofficial. Compose, save, and launch X (formerly Twitter) advanced search URLs. Not affiliated with X Corp.

### Description (required, 16,000 char max)

```
X Search Toolkit (Unofficial) is a Chrome extension that helps you
compose, save, and launch X (formerly Twitter) advanced-search URLs
from a side panel — without scraping, automation, or API calls. The
extension only generates URLs and opens them in your existing browser
session.

═══ What it does ═══

A guided builder for X's advanced search with first-class operator
helpers (from:, to:, since:, until:, min_faves:, min_retweets:,
filter:images, filter:videos, filter:links, filter:replies, lang:),
plus per-mode tabs that map to X's native result modes — Top, Latest,
People, and Media. A live URL preview updates as you compose, and
every search can be saved to your local library for one-click re-use.

═══ Use cases ═══

• Latest from an author — past week: from:<handle> since:YYYY-MM-DD
  on the Latest tab. The leading @ is stripped automatically if you
  paste it.

• High-engagement tweets on a topic: <keyword> min_faves:500
  filter:replies on the Top tab — fast triage of what's resonating.

• Image-only results for a hashtag: #<tag> filter:images on the
  Media tab. The leading # is stripped automatically if you include
  it.

• Replies to an account: to:<handle> -filter:retweets — surface the
  conversation around a specific user.

• Date-bound news scan: <keyword> since:YYYY-MM-DD until:YYYY-MM-DD
  lang:en on the Latest tab.

═══ What it does NOT do ═══

• No background scraping. No content scripts running on page load.
  No scheduled fetches.
• No automation. No clicks, no API calls, no scraping of x.com or
  twitter.com.
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

Not affiliated with, endorsed by, or sponsored by X Corp.
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

Drop file: `packages/x/public/icons/icon-128.png` (or extract from
`release/x-v0.1.0.zip` → `icons/icon-128.png`).

Currently a 4 KB geometric placeholder. Accepted by Chrome; consider
replacing with a real branded icon later.

### Global promo video

**Leave blank.** Not required; you'd need a YouTube URL.

### Screenshots (required, 1–4 at 1280×800 or 640×400)

Take all 4 after loading `packages/x/dist/` as an unpacked extension.
Suggested set in order (reviewer-friendly: each shows a distinct
feature):

1. **Templates view** — section list with one card hovered to show
   Open/Customize buttons.
2. **Builder** — with operator helpers populated (e.g. `from:`,
   `min_faves:`, `filter:images`) and the live URL preview visible at
   the bottom showing the assembled `?q=...` and mode tab.
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
Generate X (Twitter) advanced-search URLs from a guided form and
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

Host the X-specific policy (Skeleton A from
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
   `x` entry.
2. Bump `packages/x/src/manifest.json` version (e.g. `0.1.1`).
3. Tag + push: `git tag x-v0.1.1 && git push --tags`. CI builds the
   patch release and uploads it (with the new family URL in X's own
   About view).
4. The OTHER 6 plugins still show `webStoreUrl: undefined` for X —
   they'll show the live link only after their next release. See
   `documents/PUBLISHING.md` §"Quick checklist for first publication"
   for the lazy-vs-eager rollout choice.
