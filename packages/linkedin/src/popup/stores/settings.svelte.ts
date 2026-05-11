import { loadKey, saveKey, type OpenUrlMode } from '@toolkit/core';
import type { RecencyPreset, SearchType } from '@lib/url-builder';

export type DisplayMode = 'sidepanel' | 'popup';
export type Theme = 'dark' | 'light' | 'system';

export interface Settings {
  displayMode: DisplayMode;
  theme: Theme;
  defaultSearchType: SearchType;
  defaultLandingView: 'templates' | 'builder' | 'saved' | 'companies';
  defaultRecency: RecencyPreset;
  openMode: OpenUrlMode;
  /** User's own LinkedIn vanity (display only — used to render the
   *  captured profile in Settings). */
  selfVanity?: string;
  /** User's own opaque LinkedIn profile token (`ACoAA…`). When set,
   *  the Posts → Posted by → "Me" chip is exposed; selecting it
   *  expands at URL-build time to a `fromMember=["<token>"]` filter
   *  (the only shape LinkedIn's faceted search currently honours for
   *  filtering by a specific person). */
  selfToken?: string;
}

const KEY = 'settings';
const THEME_LS_KEY = 'tk_theme';

const DEFAULTS: Settings = {
  displayMode: 'sidepanel',
  theme: 'light',
  defaultSearchType: 'posts',
  defaultLandingView: 'templates',
  defaultRecency: '24h',
  openMode: 'current-tab',
};

const DISPLAY_MODES: ReadonlySet<DisplayMode> = new Set([
  'sidepanel',
  'popup',
]);
const THEMES: ReadonlySet<Theme> = new Set(['dark', 'light', 'system']);
const SEARCH_TYPES: ReadonlySet<SearchType> = new Set([
  'posts',
  'jobs',
  'people',
]);
const LANDING_VIEWS: ReadonlySet<Settings['defaultLandingView']> = new Set([
  'templates',
  'builder',
  'saved',
  'companies',
]);
const RECENCIES: ReadonlySet<RecencyPreset> = new Set([
  '15min',
  '30min',
  '1h',
  '24h',
  'week',
  'month',
  'any',
]);
const OPEN_MODES: ReadonlySet<OpenUrlMode> = new Set([
  'new-tab',
  'current-tab',
]);

const pick = <T>(allowed: ReadonlySet<T>, value: unknown, fallback: T): T =>
  allowed.has(value as T) ? (value as T) : fallback;

const pickString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const PROFILE_TOKEN_RE = /^ACoA[A-Za-z0-9_-]{20,}$/;
const pickProfileToken = (value: unknown): string | undefined => {
  const s = pickString(value);
  return s && PROFILE_TOKEN_RE.test(s) ? s : undefined;
};

/** Strict pre-import validation — rejects unsupported enum values
 *  before `clearAll()` runs. Wired via `restoreImport(..., { validate })`. */
export const validateBackup = (
  payload: Record<string, unknown>
): { ok: true } | { ok: false; reason: string } => {
  if (!('settings' in payload)) return { ok: true };
  const s = payload.settings;
  if (!s || typeof s !== 'object' || Array.isArray(s)) {
    return { ok: false, reason: '`settings` must be an object.' };
  }
  const r = s as Record<string, unknown>;
  const checks: Array<[string, ReadonlySet<unknown>, unknown]> = [
    ['displayMode', DISPLAY_MODES, r.displayMode],
    ['theme', THEMES, r.theme],
    ['defaultSearchType', SEARCH_TYPES, r.defaultSearchType],
    ['defaultLandingView', LANDING_VIEWS, r.defaultLandingView],
    ['defaultRecency', RECENCIES, r.defaultRecency],
    ['openMode', OPEN_MODES, r.openMode],
  ];
  for (const [key, allowed, val] of checks) {
    if (val !== undefined && !allowed.has(val)) {
      return {
        ok: false,
        reason: `\`settings.${key}\` has unsupported value "${String(val)}".`,
      };
    }
  }
  return { ok: true };
};

/** Coerce arbitrary persisted/imported data into a valid Settings object.
 *  Unknown enum values fall back to defaults so a malformed restore can't
 *  brick the popup (e.g. an unsupported `defaultLandingView` rendering
 *  nothing). */
const sanitizeSettings = (raw: unknown): Settings => {
  const r =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    displayMode: pick(DISPLAY_MODES, r.displayMode, DEFAULTS.displayMode),
    theme: pick(THEMES, r.theme, DEFAULTS.theme),
    defaultSearchType: pick(
      SEARCH_TYPES,
      r.defaultSearchType,
      DEFAULTS.defaultSearchType
    ),
    defaultLandingView: pick(
      LANDING_VIEWS,
      r.defaultLandingView,
      DEFAULTS.defaultLandingView
    ),
    defaultRecency: pick(
      RECENCIES,
      r.defaultRecency,
      DEFAULTS.defaultRecency
    ),
    openMode: pick(OPEN_MODES, r.openMode, DEFAULTS.openMode),
    selfVanity: pickString(r.selfVanity),
    selfToken: pickProfileToken(r.selfToken),
  };
};

const writeThemeToLS = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_LS_KEY, theme);
  } catch {
    /* ignore — localStorage may be unavailable */
  }
};

class SettingsStore {
  value = $state<Settings>({ ...DEFAULTS });
  loaded = $state(false);

  async load(): Promise<void> {
    const stored = await loadKey<unknown>(KEY, {});
    this.value = sanitizeSettings(stored);
    writeThemeToLS(this.value.theme);
    this.loaded = true;
  }

  async update(patch: Partial<Settings>): Promise<void> {
    this.value = sanitizeSettings({ ...this.value, ...patch });
    if (patch.theme) writeThemeToLS(this.value.theme);
    await saveKey(KEY, $state.snapshot(this.value));
  }

  async reset(): Promise<void> {
    this.value = { ...DEFAULTS };
    writeThemeToLS(this.value.theme);
    await saveKey(KEY, $state.snapshot(this.value));
  }
}

export const settings = new SettingsStore();
