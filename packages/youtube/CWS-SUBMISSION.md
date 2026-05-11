# YouTube Search Toolkit — Chrome Web Store Submission

Field-by-field copy-paste for the CWS Developer Dashboard submission
form. Open this alongside the dashboard and paste as you go.

Companion docs:
- [`documents/PUBLISHING.md`](../../documents/PUBLISHING.md) — full publishing playbook
- [`documents/CWS-LISTING.md`](../../documents/CWS-LISTING.md) — shared field reference

---

## Store listing tab

### Title (from manifest, read-only)

> YouTube Search Toolkit (Unofficial)

### Summary (from manifest, read-only — 110 chars)

> Unofficial. Compose, save, and launch YouTube search URLs with sp= filter presets. Not affiliated with Google.

### Description (required, 16,000 char max)

```
YouTube Search Toolkit (Unofficial) is a Chrome extension that helps
you compose, save, and launch YouTube search URLs from a side panel
— without scraping, automation, or API calls. The extension only
generates URLs and opens them in your existing browser session.

═══ What it does ═══

A guided builder for YouTube's keyword search with preset filter
combinations (today, this week, this month, HD, long-form, CC
license, channels, playlists). The presets are emitted as YouTube's
opaque `sp=` filter token. A live URL preview updates as you compose,
and every search can be saved to your local library for one-click
re-use.

Note: the `sp=` token is inferred from YouTube's UI and may need
refreshing if YouTube renames or reshuffles its presets.

═══ Use cases ═══

• Today's uploads on a topic: <keyword> with the "Today" preset —
  newsroom-style monitoring of fresh content.

• Long-form, HD-only research scan: <keyword> with "Long (>20 min) +
  HD" combined — deep-dive viewing without sifting Shorts.

• CC-licensed clips for a project: <keyword> with the "Creative
  Commons" preset — ready-to-cite material.

• Channels-only discovery: <keyword> with the "Channels" filter —
  find creators on a topic without wading through videos.

• This-week playlists on a topic: <keyword> with "Playlists" + "This
  week" — surface freshly curated lists.

═══ What it does NOT do ═══

• No background scraping. No content scripts running on page load.
  No scheduled fetches.
• No automation. No clicks, no API calls, no scraping of
  youtube.com.
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

Not affiliated with, endorsed by, or sponsored by YouTube or Google.
```

Replace the three `<...>` placeholders before saving.

### Category

> **Productivity**

(Search Tools also defensible. Productivity is the safer pick.)

### Language

> **English (United States)**

---

## Graphic assets

### Store icon (required, 128×128)

Drop file: `packages/youtube/public/icons/icon-128.png` (or extract
from `release/youtube-v0.1.0.zip` → `icons/icon-128.png`).

Currently a 4 KB geometric placeholder. Accepted by Chrome; consider
replacing with a real branded icon later.

### Global promo video

**Leave blank.** Not required; you'd need a YouTube URL.

### Screenshots (required, 1–4 at 1280×800 or 640×400)

Take all 4 after loading `packages/youtube/dist/` as an unpacked
extension. Suggested set in order (reviewer-friendly: each shows a
distinct feature):

1. **Templates view** — section list with one card hovered to show
   Open/Customize buttons.
2. **Builder** — with a preset selected (e.g. "Today + HD" or
   "Long + Creative Commons") and the live URL preview at the bottom
   showing the assembled `?search_query=...&sp=...`.
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
Generate YouTube search URLs (keyword + opaque sp= preset filter
token) and launch them in the user's existing browser session.
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

Host the YouTube-specific policy (Skeleton A from
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
   `youtube` entry.
2. Bump `packages/youtube/src/manifest.json` version (e.g. `0.1.1`).
3. Tag + push: `git tag youtube-v0.1.1 && git push --tags`. CI builds
   the patch release and uploads it (with the new family URL in
   YouTube's own About view).
4. The OTHER 6 plugins still show `webStoreUrl: undefined` for
   YouTube — they'll show the live link only after their next
   release. See `documents/PUBLISHING.md` §"Quick checklist for first
   publication" for the lazy-vs-eager rollout choice.
