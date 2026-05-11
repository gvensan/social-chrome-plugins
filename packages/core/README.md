# @toolkit/core

Shared utilities and Svelte 5 components used by every plugin in this
monorepo. Not published to npm — consumed via workspace symlink as
`@toolkit/core`.

This package is intentionally small and stable. Plugins import named
exports from `@toolkit/core` and never reach into internal paths.

---

## What's in here

### Storage

- `loadKey<T>(key, fallback)` / `saveKey(key, value)` / `dumpAll()` /
  `clearAll()` / `importAll()` — Promise-based wrappers around
  `chrome.storage.local` with an in-memory fallback for non-extension
  contexts (unit tests, Vite dev mode in a plain browser tab).
- `SavedSearchesStore<T>` (class, in `stores/saved.svelte.ts`) —
  generic saved-searches store. Each plugin instantiates one:
  `export const savedSearches = new SavedSearchesStore<SearchInput>();`
  Implements `create` / `update` / `overwrite` / `remove` / `duplicate`
  / `markOpened` / `findByUrl` / `byId` / `allTags`. The `search` field
  is opaque JSON — the store doesn't reach into it.

### Browser

- `openUrl(url, mode)` — opens a URL in a new tab (`'new-tab'`,
  default) or navigates the active tab (`'current-tab'`). Resilient
  to `chrome://` / `chrome-extension://` pages where `tabs.update`
  rejects — falls back to `tabs.create`.
- `getActiveTabUrl()` — reads the URL of the active tab. Returns
  `undefined` outside a Chrome extension context. Plugins with
  `host_permissions` only see URLs of matching hosts; others (with no
  host permission) get only their own extension URLs.
- `copyText(text)` — clipboard write with a boolean result.

### Backup

- `buildExport({ pluginId, pluginName, version })` — dumps every key
  in `chrome.storage.local` and wraps with `__toolkit` metadata.
- `restoreImport(parsed, expectedPluginId, options?)` — validates the
  payload (metadata + built-in shape gate for `settings` /
  `savedSearches` + optional per-plugin `validate` callback) and, on
  success, runs `clearAll()` followed by `importAll(payload)`. **No
  storage is modified if validation fails.**
- `Validator` type — `(payload) => { ok: true } | { ok: false, reason }`
  — plugins implement this to reject malformed enum values etc. before
  storage is replaced.

### Router

- `router` (in `stores/router.svelte.ts`) — generic view router with
  `go(view: string)` and `current` ($state). Plugins drive their own
  view enums; the router stays string-typed.

### Family (cross-plugin discovery)

- `family.ts` exports the curated list of sibling toolkits with name,
  short description, and optional `webStoreUrl`. The `FamilyCard` and
  `FamilySection` components render this list in About / Settings views
  for cross-promotion. **Bundled at build time** — when a new plugin
  is published, every sibling needs a re-build to surface the live
  link (see `documents/PUBLISHING.md` for the lazy vs. eager rollout
  trade-off).

### Components

| Component | Purpose |
| --- | --- |
| `Tabs` | Horizontal tabs (used for view navigation, top-level form tabs) |
| `Toggle` | Boolean switch with label |
| `ChipGroup` | Multi-select chip group |
| `Select` | Native `<select>` wrapper |
| `KeywordsField` | Keyword input with Boolean helper hookup |
| `BooleanHelper` | Modal helper that inserts `AND`/`OR`/`NOT`/quotes |
| `CollapsibleSection` | Templates view's section accordions |
| `FamilyCard` / `FamilySection` | Cross-plugin promotion in About |
| `SaveSearchDialog` | Modal for naming + tagging a search; duplicate-URL detection with "Update X instead" pivot; overwrite-on-Save when `editingId` is provided |
| `SavedSearchRow` | One row per saved search in the Saved view; pluggable `typeLabel` + `onOpen` + `onEdit` callbacks |
| `EditingBanner` | Shown in the Builder when an existing saved entry is loaded for editing; Update / Save-as-new / Exit |
| `Spinner` | Small circular CSS spinner for busy-state feedback on capture buttons |

---

## Adding to core

Some heuristics for what belongs here vs. in a plugin:

- **Belongs in core**: anything used by ≥2 plugins, or that we expect
  ≥2 plugins to use within the next few releases. Generic UI
  primitives, storage helpers, the save infrastructure, the router.
- **Stays plugin-local**: anything tied to a specific platform's URL
  shape (`url-builder/`, `params.ts`, `templates.ts`), plugin-specific
  state (companies / people / self-profile token), platform-specific
  parsers/extractors.

When adding a component, export it from `src/index.ts` and add to the
component table above. Keep core's footprint small — every kilobyte
ships in all 7 extensions.

---

## Tests

```bash
npx vitest run            # from packages/core/
```

Tests cover the storage layer, backup/restore, the router, and the
save-store logic. Components are tested indirectly via plugin tests.
