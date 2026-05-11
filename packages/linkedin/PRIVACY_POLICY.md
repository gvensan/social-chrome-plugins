# LinkedIn Feed Toolkit (Unofficial) — Privacy Policy

**Effective date:** 2026-05-11

LinkedIn Feed Toolkit ("the extension") is an **independent third-party (unofficial)** browser extension that helps you compose, save, and launch LinkedIn search URLs from a side
panel. This policy describes what data the extension processes, where
it is stored, and what permissions it uses.

## Summary

- The extension does **not** collect, transmit, or share any user data
  with the developer or any third party.
- All saved searches, saved companies, saved people, and settings are
  stored **locally** on your device via `chrome.storage.local` and
  never leave your browser.
- The extension makes network requests only to (a) navigate browser
  tabs to LinkedIn URLs that you explicitly composed, and (b) when you
  explicitly click a capture button, fetch a single LinkedIn URL with
  your session cookies to extract a numeric company ID or opaque
  profile token. **No background, scheduled, or automated requests.**

## Data the extension stores

All of the following is stored in `chrome.storage.local`, which is
scoped to your Chrome profile on this device and does not sync across
devices unless you manually export/import:

- **Saved searches** — names, tags, and the search-input shape you
  composed (keywords, filters, etc.) plus the resulting URL.
- **Saved companies** — friendly labels, optional numeric company IDs,
  and optional LinkedIn company slugs.
- **Saved people** — friendly labels, optional opaque LinkedIn
  profile tokens (`ACoAA…`), optional legacy numeric member IDs, and
  optional vanity slugs.
- **Your own LinkedIn profile token** (optional) — captured if you
  explicitly use the "From current tab" or "Resolve" button in
  Settings → Your LinkedIn profile, to enable the "Me" filter in the
  Posts builder.
- **Settings** — theme, display mode (popup vs side panel), default
  search type, default landing view, default recency, open mode
  (current tab vs new tab).

This data is **not transmitted anywhere**. The "Export JSON" feature
in Settings → Backup writes this data to a file on your disk via the
browser's standard download mechanism; the extension does not upload
the file.

## Permissions used

### `storage`

Used to persist saved searches, saved entities (companies and people),
and settings locally via `chrome.storage.local`.

### `sidePanel`

Used to render the extension UI as a Chrome side panel. You can
switch to a classic popup in Settings; both modes render the same UI.

### `scripting`

Used **only** by the "From current tab" / "Get ID" / "Get token"
buttons in Filters and in Settings → Your LinkedIn profile. On your
explicit click, the extension injects a one-shot function into the
active LinkedIn tab that runs a single regular-expression match
against the rendered HTML:

- `/urn:li:fsd_company:(\d+)/` for company pages, or
- `/(?:urn:li:fsd_profile:|\/in\/)(ACoA[A-Za-z0-9_-]{20,})/` for
  profile pages.

The function returns only the matched ID or profile token to the
extension. It reads no other DOM content, makes no network requests,
and **never runs on page load, on navigation, or on any
non-user-initiated event**.

### `host_permissions: ["*://*.linkedin.com/*"]`

Scoped to LinkedIn only. Required so that:

1. The `scripting` capability above can target LinkedIn tabs.
2. The toolkit can read the active tab's URL via `chrome.tabs.query`
   to detect when you are on a LinkedIn company or profile page and
   offer the "From current tab" capture button.
3. On user-initiated capture, the extension can make a **single
   same-origin** `fetch()` to a `/company/<slug>/`, `/in/<vanity>/`,
   or `/me/` URL with your session cookies, to recover an ID or
   profile token when the active tab does not already carry it.

**No non-LinkedIn tab data is ever accessed.** The extension cannot
see the URLs or content of your other tabs (Gmail, banking, etc.).
The extension never runs on LinkedIn tabs except on explicit user
click, never observes page changes, and never records or transmits
tab content beyond the single regex match described above.

## What the extension does NOT do

- No background scraping. No content scripts that run on page load.
  No scheduled, recurring, or polling reads.
- No automation. No clicks, no API calls beyond the user-initiated
  single fetches described above.
- No data sold or transferred to third parties.
- No data used for advertising, profiling, or analytics.
- No data used to determine creditworthiness or for lending purposes.
- No data sent to the developer or any external server. The extension
  has no developer-controlled backend.
- No cookies read or modified by the extension code. (The
  user-initiated `fetch()` to a LinkedIn URL is same-origin and uses
  the browser's own cookie store, the same way visiting that URL in
  a normal tab would.)

## Third-party services

The extension does not use any third-party services, analytics
providers, error-reporting services, or remote configuration.

## User rights and choices

Because the extension stores all data locally and transmits nothing,
you have complete control:

- **View** your data via Settings → Backup → "Export JSON."
- **Modify** any saved search, company, or person from inside the
  extension UI (Rename, Delete, etc.).
- **Delete** all extension data at any time by removing the
  extension from Chrome — that automatically clears its
  `chrome.storage.local` namespace.

## Changes to this policy

This policy may be updated as the extension evolves. Any material
change will be reflected in a new "Effective date" at the top of this
document. The latest version is always available at the URL where you
read this policy.

## Contact

For questions about this privacy policy, file an issue at:

<https://github.com/gvensan/social-chrome-plugins/issues>

## Disclaimer

This extension is not affiliated with, endorsed by, or sponsored by
LinkedIn Corporation.
