export type OpenUrlMode = 'new-tab' | 'current-tab';

/**
 * Navigate to a URL using the chrome.tabs API. Defaults to opening a
 * fresh new tab; pass `'current-tab'` to navigate the active tab in
 * the current window instead.
 *
 * For `'current-tab'`: uses `chrome.tabs.query` to find the active
 * tab's ID, then `chrome.tabs.update` to navigate it. Both calls work
 * without `host_permissions` for the destination URL — no extra
 * permissions needed beyond the basic tab APIs.
 *
 * Resilience: if `query` or `update` rejects (e.g. the active tab is a
 * privileged `chrome://` URL where extensions can't navigate it, the
 * tab was discarded mid-call, or there's no usable active tab), falls
 * back to `tabs.create` so the user-initiated open never silently
 * no-ops.
 */
export const openUrl = (
  url: string,
  mode: OpenUrlMode = 'new-tab'
): void => {
  const c = (globalThis as { chrome?: typeof chrome }).chrome;

  const fallbackOpen = (): void => {
    if (c?.tabs?.create) {
      void c.tabs.create({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (mode === 'current-tab' && c?.tabs?.query && c?.tabs?.update) {
    void (async () => {
      try {
        const tabs = await c.tabs.query({
          active: true,
          currentWindow: true,
        });
        const id = tabs[0]?.id;
        if (id === undefined) {
          fallbackOpen();
          return;
        }
        try {
          await c.tabs.update(id, { url });
        } catch {
          // tabs.update can reject when the active tab is on a
          // chrome:// / chrome-extension:// page, or the tab was
          // discarded between query and update. Either way, open a
          // fresh tab instead of leaving the click as a no-op.
          fallbackOpen();
        }
      } catch {
        fallbackOpen();
      }
    })();
    return;
  }

  fallbackOpen();
};

/**
 * Read the URL of the active tab in the current window. Uses the
 * `tabs` permission only — no host permissions, no content scripts,
 * no DOM access. Returns undefined when run outside a browser context
 * (e.g. unit tests) or when no active tab is available.
 */
export const getActiveTabUrl = async (): Promise<string | undefined> => {
  const c = (globalThis as { chrome?: typeof chrome }).chrome;
  if (!c?.tabs?.query) return undefined;
  try {
    const tabs = await c.tabs.query({ active: true, currentWindow: true });
    return tabs[0]?.url;
  } catch {
    return undefined;
  }
};

export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
