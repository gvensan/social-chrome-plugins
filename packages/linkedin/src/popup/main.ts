import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

type HostMode = 'popup' | 'sidepanel';
type Theme = 'dark' | 'light' | 'system';

const THEME_LS_KEY = 'tk_theme';

const detectHostMode = async (): Promise<HostMode> => {
  const c = (globalThis as { chrome?: typeof chrome }).chrome;
  if (c?.runtime?.getContexts) {
    try {
      const contexts = await c.runtime.getContexts({
        documentUrls: [location.href],
      });
      const ctx = contexts[0];
      if (ctx?.contextType === 'SIDE_PANEL') return 'sidepanel';
      if (ctx?.contextType === 'POPUP') return 'popup';
    } catch {
      /* fall through */
    }
  }
  return 'popup';
};

const isSystemDark = (): boolean =>
  globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

const resolveTheme = (theme: Theme): boolean =>
  theme === 'dark' || (theme === 'system' && isSystemDark());

const applyTheme = (theme: Theme): void => {
  document.documentElement.classList.toggle('dark', resolveTheme(theme));
};

// Apply theme synchronously from localStorage to prevent a flash of
// the wrong theme on boot. The settings store overwrites this once
// chrome.storage.local resolves, but for returning users the values
// match — no flash.
const initialTheme = ((): Theme => {
  try {
    const v = localStorage.getItem(THEME_LS_KEY);
    if (v === 'dark' || v === 'light' || v === 'system') return v;
  } catch {
    /* ignore */
  }
  return 'light';
})();
applyTheme(initialTheme);

const start = async () => {
  const mode = await detectHostMode();
  document.body.classList.add(`mode-${mode}`);

  const target = document.getElementById('app');
  if (!target) throw new Error('Mount target #app not found.');
  mount(App, { target });
};

void start();
