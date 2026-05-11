# GitHub Search Toolkit (Unofficial) — Privacy Policy

**Effective date:** 2026-05-11

GitHub Search Toolkit ("the extension") is an **independent third-party (unofficial)** browser extension that helps you compose, save, and launch GitHub search URLs from a side
panel. This policy describes what data the extension processes, where
it is stored, and what permissions it uses.

## Summary

- The extension does **not** collect, transmit, or share any user data
  with the developer or any third party.
- All saved searches and settings are stored **locally** on your
  device via `chrome.storage.local` and never leave your browser.
- The extension makes network requests only to navigate browser tabs
  to URLs you explicitly composed. **No background, scheduled, or
  automated requests.**

## Data the extension stores

All of the following is stored in `chrome.storage.local`, which is
scoped to your Chrome profile on this device and does not sync across
devices unless you manually export/import:

- **Saved searches** — names, tags, and the search-input shape you
  composed (keywords, qualifiers, filters, etc.) plus the resulting
  github.com search URL.
- **Tags** — labels you attach to saved searches for organization.
- **Settings** — theme, display mode (popup vs side panel), default
  search type (`defaultSearchType`: repositories, code, issues, etc.),
  default landing view, open mode (current tab vs new tab).

This data is **not transmitted anywhere**. The "Export JSON" feature
in Settings → Backup writes this data to a file on your disk via the
browser's standard download mechanism; the extension does not upload
the file.

## Permissions used

### `storage`

Used to persist saved searches, tags, and settings locally via
`chrome.storage.local`.

### `sidePanel`

Used to render the extension UI as a Chrome side panel. You can
switch to a classic popup in Settings; both modes render the same UI.

## What the extension does NOT do

- No background scraping. No content scripts. No scheduled,
  recurring, or polling reads.
- No automation. No clicks, no API calls. The extension only opens
  user-composed URLs in browser tabs.
- No data sold or transferred to third parties.
- No data used for advertising, profiling, or analytics.
- No data used to determine creditworthiness or for lending purposes.
- No data sent to the developer or any external server. The extension
  has no developer-controlled backend.
- The extension declares no `host_permissions` and runs no content
  scripts. It cannot see the URLs or content of any of your tabs.

## Third-party services

The extension does not use any third-party services, analytics
providers, error-reporting services, or remote configuration.

## User rights and choices

Because the extension stores all data locally and transmits nothing,
you have complete control:

- **View** your data via Settings → Backup → "Export JSON."
- **Modify** any saved search or tag from inside the extension UI
  (Rename, Delete, etc.).
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
GitHub, Inc. or Microsoft Corporation.
