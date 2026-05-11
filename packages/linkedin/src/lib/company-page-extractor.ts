/**
 * Layered, "always-works-if-signed-in" extraction of the LinkedIn
 * company URN ID.
 *
 * Strategies, tried in order until one succeeds:
 *   1. Immediate DOM scan — fast (~ms), works when the URN is in the
 *      initial server-rendered HTML.
 *   2. MutationObserver wait (up to 3s) — handles LinkedIn's
 *      lazy-hydration where the URN appears in the DOM after a section
 *      mounts. Resolves immediately when found.
 *   3. In-page fetch fallback — re-fetches the company page from the
 *      page context (linkedin.com origin, with cookies). Returns the
 *      fully server-rendered HTML, which reliably contains the URN
 *      even when the user's loaded DOM has been hydrated / cleaned.
 *
 * Permissions: `scripting` + `host_permissions: ["*://*.linkedin.com/*"]`.
 * Triggered only on explicit user action.
 */

const LINKEDIN_HOST_RE = /(^|\.)linkedin\.com$/;

const URN_PATTERNS: ReadonlyArray<RegExp> = [
  /urn:li:fsd_company:(\d+)/,
  /urn:li:company:(\d+)/,
  /urn%3Ali%3A(?:fsd_)?company%3A(\d+)/i,
  /urn&#x3A;li&#x3A;(?:fsd_)?company&#x3A;(\d+)/i,
];

const scanForUrn = (html: string): string | null => {
  for (const re of URN_PATTERNS) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
};

export type ExtractStrategy = 'dom' | 'observer' | 'fetch' | 'ext-fetch';

export type ExtractIdResult =
  | { ok: true; id: string; strategy: ExtractStrategy; pageUrl: string }
  | { ok: false; reason: string; pageUrl?: string };

export interface ExtractOptions {
  /**
   * Slug to use for the fetch-fallback strategy. If omitted, the slug
   * is derived from the active tab's URL (must match
   * `/company/<slug>/`). Pass this from the upgrade flow when you
   * already know which company you want — it lets the user stay on
   * any LinkedIn tab instead of navigating to the specific page.
   */
  fetchSlug?: string;
}

export const extractCompanyIdFromTab = async (
  opts: ExtractOptions = {}
): Promise<ExtractIdResult> => {
  const c = (globalThis as { chrome?: typeof chrome }).chrome;
  if (!c?.scripting?.executeScript || !c?.tabs?.query) {
    return {
      ok: false,
      reason: 'Chrome extension APIs not available in this context.',
    };
  }

  let tab: chrome.tabs.Tab | undefined;
  try {
    const tabs = await c.tabs.query({ active: true, currentWindow: true });
    tab = tabs[0];
  } catch (e) {
    return { ok: false, reason: `Tab query failed: ${String(e)}` };
  }
  if (!tab?.id) {
    return { ok: false, reason: 'No active tab found in this window.' };
  }
  if (!tab.url) {
    return {
      ok: false,
      reason:
        "Active tab URL is hidden — the toolkit only sees URLs of linkedin.com tabs. Switch to your LinkedIn tab and try again.",
    };
  }

  let host: string;
  let pathname: string;
  try {
    const u = new URL(tab.url);
    host = u.hostname;
    pathname = u.pathname;
  } catch {
    return { ok: false, reason: `Couldn't parse tab URL: ${tab.url}` };
  }
  if (!LINKEDIN_HOST_RE.test(host)) {
    return {
      ok: false,
      reason: `Active tab is on ${host}, not linkedin.com. Switch to any LinkedIn tab so the toolkit can run on it (you don't need to be on the specific company's page — the fetch fallback will find it).`,
      pageUrl: tab.url,
    };
  }

  // Slug to use for the fetch fallback. Prefer the explicit override
  // (from the upgrade flow), else derive from the current URL.
  let slugToFetch = opts.fetchSlug;
  if (!slugToFetch) {
    const m = pathname.match(/^\/company\/([^/]+)/);
    if (m) slugToFetch = m[1];
  }

  try {
    const results = await c.scripting.executeScript({
      target: { tabId: tab.id },
      args: [slugToFetch ?? null] as [string | null],
      // Note: this function runs in the page's content world. It can't
      // close over outer-scope variables — everything must be inlined.
      func: async (slug: string | null) => {
        const PATTERNS = [
          /urn:li:fsd_company:(\d+)/,
          /urn:li:company:(\d+)/,
          /urn%3Ali%3A(?:fsd_)?company%3A(\d+)/i,
          /urn&#x3A;li&#x3A;(?:fsd_)?company&#x3A;(\d+)/i,
        ];

        const scan = (html: string): string | null => {
          for (const re of PATTERNS) {
            const m = html.match(re);
            if (m) return m[1];
          }
          return null;
        };

        // Strategy 1: immediate DOM scan.
        let id = scan(document.documentElement.innerHTML);
        if (id) return { ok: true as const, id, strategy: 'dom' as const };

        // Strategy 2: MutationObserver — wait up to 3s for URN to
        // appear via lazy-loaded content.
        id = await new Promise<string | null>((resolve) => {
          let done = false;
          const finish = (v: string | null) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            observer.disconnect();
            resolve(v);
          };
          const observer = new MutationObserver(() => {
            const found = scan(document.documentElement.innerHTML);
            if (found) finish(found);
          });
          const timer = setTimeout(() => finish(null), 3000);
          observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: false,
          });
        });
        if (id) {
          return { ok: true as const, id, strategy: 'observer' as const };
        }

        // Strategy 3: in-page fetch. Same-origin to linkedin.com, uses
        // the user's cookies. Returns fully server-rendered HTML.
        if (slug) {
          try {
            const url = `https://www.linkedin.com/company/${encodeURIComponent(slug)}/`;
            const response = await fetch(url, {
              credentials: 'include',
              redirect: 'follow',
            });
            if (response.ok) {
              const text = await response.text();
              const fetched = scan(text);
              if (fetched) {
                return {
                  ok: true as const,
                  id: fetched,
                  strategy: 'fetch' as const,
                };
              }
              // The HTML came back but no URN — most likely the slug
              // doesn't exist OR the user isn't signed in (LinkedIn
              // serves a marketing page to logged-out visitors).
              return {
                ok: false as const,
                reason:
                  'Fetched the company page but no URN was in the response. Most likely you\'re not signed in to LinkedIn in this browser profile, or the slug is invalid.',
              };
            }
            return {
              ok: false as const,
              reason: `Fetch to /company/${slug}/ returned HTTP ${response.status}.`,
            };
          } catch (e) {
            return {
              ok: false as const,
              reason: `Fetch fallback failed: ${String(e)}`,
            };
          }
        }

        // Strategies 1+2 failed and no slug was available for strategy 3.
        return {
          ok: false as const,
          reason:
            'No URN appears in the page DOM after waiting 3s, and no slug was available to fetch the company page directly.',
        };
      },
    });
    const result = results[0]?.result;
    if (!result) {
      return {
        ok: false,
        reason: 'Scripting returned no result. The page may have closed or navigated.',
        pageUrl: tab.url,
      };
    }
    if (result.ok) {
      return {
        ok: true,
        id: result.id,
        strategy: result.strategy,
        pageUrl: tab.url,
      };
    }
    return { ok: false, reason: result.reason, pageUrl: tab.url };
  } catch (e) {
    return {
      ok: false,
      reason: `Scripting injection failed: ${String(e)}`,
      pageUrl: tab.url,
    };
  }
};

const PERSON_URN_PATTERNS: ReadonlyArray<RegExp> = [
  /urn:li:fsd_member:(\d+)/,
  /urn:li:member:(\d+)/,
  /urn%3Ali%3A(?:fsd_)?member%3A(\d+)/i,
  /urn&#x3A;li&#x3A;(?:fsd_)?member&#x3A;(\d+)/i,
];

const scanForMemberUrn = (html: string): string | null => {
  for (const re of PERSON_URN_PATTERNS) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
};

/**
 * Patterns that capture the opaque LinkedIn profile token —
 * `ACoAA...` followed by base64url chars. These tokens are what
 * LinkedIn's faceted search now uses for the `fromMember` filter
 * (the legacy `urn:li:fsd_member:<numeric>` form is silently dropped).
 *
 * Tried in order; URN-anchored patterns win because they bind the
 * token to a known profile context. The bare-token fallback at the
 * end catches cases where LinkedIn renames the URN family — it picks
 * the first ACoA… in the HTML, which on a profile page is reliably
 * the page owner (canonical link, page meta, first JSON state block).
 */
const PROFILE_TOKEN_PATTERNS: ReadonlyArray<RegExp> = [
  /urn:li:fsd_profile:(ACoA[A-Za-z0-9_-]{20,})/,
  /urn:li:fs_miniProfile:(ACoA[A-Za-z0-9_-]{20,})/,
  /urn:li:fs_profile:(ACoA[A-Za-z0-9_-]{20,})/,
  /urn:li:fs_member:(ACoA[A-Za-z0-9_-]{20,})/,
  /urn%3Ali%3A(?:fsd_profile|fs_miniProfile|fs_profile|fs_member)%3A(ACoA[A-Za-z0-9_-]{20,})/i,
  /urn&#x3A;li&#x3A;(?:fsd_profile|fs_miniProfile|fs_profile|fs_member)&#x3A;(ACoA[A-Za-z0-9_-]{20,})/i,
  /\/in\/(ACoA[A-Za-z0-9_-]{20,})\b/,
  // Last-resort bare match. On a profile page the first ACoA… in the
  // HTML is the page owner; on other pages this could mis-target
  // (e.g. a sidebar suggestion) so URN matches are preferred above.
  /\b(ACoA[A-Za-z0-9_-]{20,})\b/,
];

const scanForProfileToken = (html: string): string | null => {
  for (const re of PROFILE_TOKEN_PATTERNS) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
};

/**
 * Tab-free member-ID lookup for individuals. Fetches
 * `https://www.linkedin.com/in/<vanity>/` from the extension context
 * with cookies; same plumbing and risk profile as
 * `extractCompanyIdViaFetch`. The URN regex set is different (member,
 * not company), and the fetched page contains the URN reliably for
 * signed-in users.
 */
export const extractPersonIdViaFetch = async (
  vanity: string
): Promise<ExtractIdResult> => {
  const url = `https://www.linkedin.com/in/${encodeURIComponent(vanity)}/`;
  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      redirect: 'follow',
    });
  } catch (e) {
    return {
      ok: false,
      reason: `Fetch to ${url} failed: ${String(e)}.`,
      pageUrl: url,
    };
  }
  if (!response.ok) {
    return {
      ok: false,
      reason: `Fetch to /in/${vanity}/ returned HTTP ${response.status} ${response.statusText}.`,
      pageUrl: url,
    };
  }
  const text = await response.text();
  const id = scanForMemberUrn(text);
  if (id) {
    return { ok: true, id, strategy: 'ext-fetch', pageUrl: url };
  }
  return {
    ok: false,
    reason:
      "Fetched the profile page but no member URN was in the response. Most likely you're not signed in to LinkedIn (it serves a marketing page to logged-out visitors), the vanity is invalid, or the profile is private.",
    pageUrl: url,
  };
};

/**
 * Self-profile lookup via the signed-in session. Fetches
 * `https://www.linkedin.com/me/`, follows the redirect that LinkedIn
 * issues to the current user's `/in/<vanity>/` page, and extracts the
 * profile token from the resulting HTML. Also returns the resolved
 * vanity (parsed from `response.url` after redirect) so callers can
 * persist a friendly display label.
 *
 * Works from any LinkedIn tab — no profile-page navigation required —
 * because the redirect is driven entirely by the user's session
 * cookies. Falls back to an error if the user isn't signed in (no
 * redirect; LinkedIn serves a marketing page).
 */
export type SelfExtractResult =
  | {
      ok: true;
      token: string;
      vanity?: string;
      strategy: ExtractStrategy;
      pageUrl: string;
    }
  | { ok: false; reason: string; pageUrl?: string };

export const extractSelfTokenViaFetch = async (): Promise<SelfExtractResult> => {
  const url = 'https://www.linkedin.com/me/';
  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      redirect: 'follow',
    });
  } catch (e) {
    return { ok: false, reason: `Fetch to ${url} failed: ${String(e)}.` };
  }
  if (!response.ok) {
    return {
      ok: false,
      reason: `Fetch to /me/ returned HTTP ${response.status} ${response.statusText}.`,
      pageUrl: response.url,
    };
  }
  // After redirects, response.url should be /in/<vanity>/ — pull the
  // vanity out of the path so we can show a friendly label.
  let vanity: string | undefined;
  try {
    const u = new URL(response.url);
    const m = u.pathname.match(/^\/in\/([^/]+)/);
    if (m && !/^ACoA[A-Za-z0-9_-]{20,}$/.test(m[1])) {
      vanity = m[1];
    }
  } catch {
    /* ignore — vanity is optional */
  }
  const text = await response.text();
  const token = scanForProfileToken(text);
  if (!token) {
    return {
      ok: false,
      reason:
        "Fetched /me/ but no profile token (ACoA…) was in the response. Most likely you're not signed in to LinkedIn in this browser profile.",
      pageUrl: response.url,
    };
  }
  return { ok: true, token, vanity, strategy: 'ext-fetch', pageUrl: response.url };
};

/**
 * Same plumbing as `extractPersonIdViaFetch`, but extracts the
 * opaque profile token (`ACoAA…`) rather than the legacy numeric
 * member ID. The token is what LinkedIn's faceted-search
 * `fromMember=["…"]` filter now requires; the numeric URN form is
 * silently dropped server-side.
 */
export const extractPersonTokenViaFetch = async (
  vanity: string
): Promise<ExtractIdResult> => {
  const url = `https://www.linkedin.com/in/${encodeURIComponent(vanity)}/`;
  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      redirect: 'follow',
    });
  } catch (e) {
    return {
      ok: false,
      reason: `Fetch to ${url} failed: ${String(e)}.`,
      pageUrl: url,
    };
  }
  if (!response.ok) {
    return {
      ok: false,
      reason: `Fetch to /in/${vanity}/ returned HTTP ${response.status} ${response.statusText}.`,
      pageUrl: url,
    };
  }
  const text = await response.text();
  const token = scanForProfileToken(text);
  if (token) {
    return { ok: true, id: token, strategy: 'ext-fetch', pageUrl: url };
  }
  return {
    ok: false,
    reason:
      "Fetched the profile page but no profile token (ACoA…) was in the response. Most likely you're not signed in to LinkedIn, the vanity is invalid, or the profile is private.",
    pageUrl: url,
  };
};

/**
 * Tab-free URN lookup. Fetches `https://www.linkedin.com/company/<slug>/`
 * directly from the extension context (popup / side panel) using the
 * user's session cookies — works regardless of which tab is active.
 *
 * Requires:
 *   - `host_permissions: ["*://*.linkedin.com/*"]` (already declared)
 *   - The user is signed in to LinkedIn in this Chrome profile
 *
 * The fetch is cross-origin from the extension's chrome-extension://
 * origin to www.linkedin.com, but `host_permissions` makes that a
 * permitted operation and `credentials: 'include'` flows the cookies
 * because LinkedIn is in the host-permission list.
 *
 * Same regex set as the in-tab path; same Beta caveat about LinkedIn
 * potentially renaming URN fields.
 */
export const extractCompanyIdViaFetch = async (
  slug: string
): Promise<ExtractIdResult> => {
  const url = `https://www.linkedin.com/company/${encodeURIComponent(slug)}/`;
  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      redirect: 'follow',
    });
  } catch (e) {
    return {
      ok: false,
      reason: `Fetch to ${url} failed: ${String(e)}. Check that the extension has host_permissions for linkedin.com (it should — declared in manifest).`,
      pageUrl: url,
    };
  }
  if (!response.ok) {
    return {
      ok: false,
      reason: `Fetch to /company/${slug}/ returned HTTP ${response.status} ${response.statusText}.`,
      pageUrl: url,
    };
  }
  const text = await response.text();
  const id = scanForUrn(text);
  if (id) {
    return { ok: true, id, strategy: 'ext-fetch', pageUrl: url };
  }
  return {
    ok: false,
    reason:
      "Fetched the company page but no URN was in the response. Most likely you're not signed in to LinkedIn in this browser profile (LinkedIn serves a marketing page to logged-out visitors), or the slug is invalid.",
    pageUrl: url,
  };
};
