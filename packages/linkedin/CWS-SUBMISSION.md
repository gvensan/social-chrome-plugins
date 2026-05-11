# LinkedIn Feed Toolkit — Chrome Web Store Submission

Field-by-field copy-paste for the CWS Developer Dashboard submission
form. Open this alongside the dashboard and paste as you go.

Companion docs:
- [`documents/PUBLISHING.md`](../../documents/PUBLISHING.md) — full publishing playbook
- [`documents/CWS-LISTING.md`](../../documents/CWS-LISTING.md) — shared field reference

---

## Store listing tab

### Title (from manifest, read-only)

> LinkedIn Feed Toolkit (Unofficial)

### Summary (from manifest, read-only — 107 chars)

> Unofficial. Compose, save, and launch LinkedIn search URLs from a side panel. Not affiliated with LinkedIn.

### Description (required, 16,000 char max)

```
LinkedIn Feed Toolkit (Unofficial) is a Chrome extension that helps
you compose, save, and launch high-signal LinkedIn search URLs from
a side panel — without scraping, automation, or API calls. The
extension only generates URLs and opens them in your existing
browser session.

═══ What it does ═══

Three search verticals — Posts, Jobs, and People — each with a typed
form that mirrors LinkedIn's native filters but is easier to reach. A
live URL preview updates as you compose, and every search can be
saved to your local library for one-click re-use.

═══ Use cases ═══

• Network feed — past 24h: Latest posts from your 1st-degree
  connections and people you follow.

• Fresh remote + Easy Apply — past hour: Newest postings, fully
  remote, one-click apply.

• Under 10 applicants + in your network — past week: Early-mover
  positioning at companies where you have a warm intro.

• Latest posts from a person: Follow a thought leader's feed without
  subscribing to alerts. One-click capture of their profile token via
  the Filters tab.

• People at a company — current and past in your network: Find anyone
  who works (or used to work) at a saved company, scoped to your
  1st + 2nd network.

═══ What it does NOT do ═══

• No background scraping. No content scripts running on page load.
  No scheduled fetches.
• No automation. No clicks, no API calls beyond user-initiated
  session-cookie fetches for ID/token extraction.
• No data leaves your device. Saved searches, companies, and people
  live in chrome.storage.local. The Export JSON feature writes to a
  file on your disk; nothing is sent over the network.

═══ Permissions used and why ═══

• storage: Persist user-defined saved searches, tags, and settings
  locally.
• sidePanel: Render the UI as a Chrome side panel so you can keep
  the Builder open while browsing.
• scripting: Used only by the "From current tab" / "Get ID" /
  "Get token" buttons in Filters and Settings. On the user's explicit
  click, the extension injects a one-shot regex match into the active
  LinkedIn tab to extract a numeric company ID or opaque profile
  token. Reads no other DOM content; runs only on explicit click.
• host_permissions for *.linkedin.com: Scoped to LinkedIn only.
  Required so the scripting capability above can target LinkedIn
  tabs, and so the toolkit can make user-initiated same-origin
  fetches to /company/<slug>/, /in/<vanity>/, or /me/ when the active
  tab doesn't already carry the ID. No non-LinkedIn tab data is ever
  accessed.

═══ Privacy ═══

Full privacy policy: <YOUR_PRIVACY_POLICY_URL>

The extension makes no network requests other than (a) user-initiated
capture fetches scoped to linkedin.com, and (b) navigating tabs to
URLs you explicitly composed.

═══ Source & support ═══

Source code: <YOUR_GITHUB_REPO_URL>
Support: <YOUR_SUPPORT_EMAIL_OR_ISSUES_URL>

Not affiliated with, endorsed by, or sponsored by LinkedIn
Corporation.
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

Drop file: `packages/linkedin/public/icons/icon-128.png` (or extract
from `release/linkedin-v0.1.0.zip` → `icons/icon-128.png`).

Currently a 4 KB geometric placeholder. Accepted by Chrome; consider
replacing with a real branded icon later.

### Global promo video

**Leave blank.** Not required; you'd need a YouTube URL.

### Screenshots (required, 1–5 at 1280×800 or 640×400)

Take all 5 after loading `packages/linkedin/dist/` as an unpacked
extension. Suggested set in order (reviewer-friendly: each shows a
distinct feature):

1. **Templates view** — section list with one card hovered to show
   "Setup needed" + Open/Customize buttons.
2. **Builder → Posts** — with a saved person picked under "From a
   person" and the live URL preview visible at the bottom.
3. **Filters → Companies** — saved company chips with the
   "From current tab" button visible (this justifies the
   `host_permissions` for the reviewer).
4. **Saved view** — 2–3 rows showing tags and the
   Open / Edit / Dup / Delete actions.
5. **Settings → Your LinkedIn profile** — the "From current tab" /
   Resolve capture flow. Shows reviewers exactly what `scripting` is
   used for.

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
Generate LinkedIn search URLs from a guided form and launch them in
the user's existing browser session. Optionally capture LinkedIn
company IDs and profile tokens (on user click) for use as filter
values.
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

**`scripting`**
```
Used solely by the "From current tab" / "Get ID" / "Get token"
buttons in Settings → Filters → Companies and Filters → People. On
the user's explicit click, the extension injects a one-shot function
into the active LinkedIn tab that runs a single regular-expression
match against the rendered HTML — either /urn:li:fsd_company:(\d+)/
(for company pages) or
/(?:urn:li:fsd_profile:|\/in\/)(ACoA[A-Za-z0-9_-]{20,})/ (for profile
pages) — and returns only the matched ID or profile token. The
function reads no other DOM content, makes no network requests, and
never runs on page load, on navigation, or on any non-user-initiated
event. The matched ID/token is then used as a filter value in
user-generated LinkedIn search URLs (currentCompany=[id],
fromMember=[token]).
```

**`host_permissions: *://*.linkedin.com/*`**
```
Scoped to LinkedIn only. Required so that (a) the scripting
capability above can target LinkedIn tabs, (b) the toolkit can read
the active tab's URL via chrome.tabs.query to detect when the user
is on a LinkedIn company/profile page and offer the "From current
tab" capture, and (c) on user-initiated capture, the extension can
make a single same-origin fetch() to a /company/<slug>/, /in/<vanity>/,
or /me/ URL with the user's session cookies to recover an ID/token
when the active tab doesn't already carry it. No non-LinkedIn tab
data is ever accessed. The extension never runs on LinkedIn tabs
except on explicit user click, never observes page changes, and never
records or transmits tab content beyond the single-regex match
described in the scripting justification.
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

Host the LinkedIn-specific policy (Skeleton B from
[`CWS-LISTING.md`](../../documents/CWS-LISTING.md#privacy-policy-url))
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
5. When clean, hit **Submit for review**. First-time review for
   LinkedIn is typically 2–7 days (the `scripting` + host permission
   combination gets manual review).

---

## After approval

Get the public listing URL from the dashboard (`Package → View in store`),
then:

1. Update `packages/core/src/family.ts` — set `webStoreUrl` for the
   `linkedin` entry.
2. Bump `packages/linkedin/src/manifest.json` version (e.g. `0.1.1`).
3. Tag + push: `git tag linkedin-v0.1.1 && git push --tags`. CI builds
   the patch release and uploads it (with the new family URL in
   LinkedIn's own About view).
4. The OTHER 6 plugins still show `webStoreUrl: undefined` for
   LinkedIn — they'll show the live link only after their next
   release. See `documents/PUBLISHING.md` §"Quick checklist for first
   publication" for the lazy-vs-eager rollout choice.
