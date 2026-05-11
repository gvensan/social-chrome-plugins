/// <reference lib="webworker" />

// MV3 service worker. Drives the popup-vs-side-panel display mode based
// on the user's setting in chrome.storage.local.

const sw = self as unknown as ServiceWorkerGlobalScope;
const POPUP_PATH = 'src/popup/index.html';

type DisplayMode = 'sidepanel' | 'popup';

interface SettingsShape {
  displayMode?: DisplayMode;
}

const readMode = async (): Promise<DisplayMode> => {
  const { settings } = await chrome.storage.local.get('settings');
  const s = settings as SettingsShape | undefined;
  return s?.displayMode ?? 'sidepanel';
};

const applyMode = async (mode: DisplayMode): Promise<void> => {
  if (mode === 'sidepanel') {
    await chrome.action.setPopup({ popup: '' });
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } else {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
    await chrome.action.setPopup({ popup: POPUP_PATH });
  }
};

const refresh = async (): Promise<void> => {
  try {
    await applyMode(await readMode());
  } catch (err) {
    console.error('[LinkedIn Feed Toolkit] failed to apply display mode', err);
  }
};

sw.addEventListener('install', () => {
  void sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await sw.clients.claim();
      await refresh();
    })()
  );
});

chrome.runtime.onInstalled.addListener(() => {
  void refresh();
});

chrome.runtime.onStartup.addListener(() => {
  void refresh();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes['settings']) return;
  void refresh();
});

export {};
