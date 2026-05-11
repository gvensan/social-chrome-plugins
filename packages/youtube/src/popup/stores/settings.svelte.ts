import { loadKey, saveKey, type OpenUrlMode } from '@toolkit/core';
import type { YouTubeFilterPreset } from '@lib/url-builder';

export type DisplayMode = 'sidepanel' | 'popup';
export type Theme = 'dark' | 'light' | 'system';

export interface Settings {
  displayMode: DisplayMode;
  theme: Theme;
  defaultPreset: YouTubeFilterPreset;
  defaultLandingView: 'templates' | 'builder' | 'saved';
  openMode: OpenUrlMode;
}

const KEY = 'settings';
const THEME_LS_KEY = 'tk_theme';

const DEFAULTS: Settings = {
  displayMode: 'sidepanel',
  theme: 'light',
  defaultPreset: 'none',
  defaultLandingView: 'templates',
  openMode: 'current-tab',
};

const DISPLAY_MODES: ReadonlySet<DisplayMode> = new Set(['sidepanel', 'popup']);
const THEMES: ReadonlySet<Theme> = new Set(['dark', 'light', 'system']);
const PRESETS: ReadonlySet<YouTubeFilterPreset> = new Set([
  'none',
  'today',
  'this-week',
  'this-month',
  'this-year',
  'sort-upload-date',
  'sort-view-count',
  'sort-rating',
  'short-videos',
  'long-videos',
  'cc-license',
  'hd-only',
  'subtitles',
  'channels',
  'playlists',
  'movies',
]);
const LANDING_VIEWS: ReadonlySet<Settings['defaultLandingView']> = new Set([
  'templates',
  'builder',
  'saved',
]);
const OPEN_MODES: ReadonlySet<OpenUrlMode> = new Set([
  'new-tab',
  'current-tab',
]);

const pick = <T>(allowed: ReadonlySet<T>, value: unknown, fallback: T): T =>
  allowed.has(value as T) ? (value as T) : fallback;

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
    ['defaultPreset', PRESETS, r.defaultPreset],
    ['defaultLandingView', LANDING_VIEWS, r.defaultLandingView],
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

const sanitizeSettings = (raw: unknown): Settings => {
  const r =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    displayMode: pick(DISPLAY_MODES, r.displayMode, DEFAULTS.displayMode),
    theme: pick(THEMES, r.theme, DEFAULTS.theme),
    defaultPreset: pick(PRESETS, r.defaultPreset, DEFAULTS.defaultPreset),
    defaultLandingView: pick(
      LANDING_VIEWS,
      r.defaultLandingView,
      DEFAULTS.defaultLandingView
    ),
    openMode: pick(OPEN_MODES, r.openMode, DEFAULTS.openMode),
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
