/**
 * Extract a LinkedIn company ID from any of the formats a user is likely
 * to paste:
 *   - Raw numeric: "1234567"
 *   - URN: "urn:li:fsd_company:1234567" or "urn:li:company:1234567"
 *   - Sales Navigator URL: ".../sales/company/1234567/..."
 *   - People search URL with currentCompany / pastCompany filter applied
 *   - Jobs search URL with f_C parameter
 *
 * Returns null for inputs we can't extract from — notably the plain
 * "linkedin.com/company/<slug>/" URL, which only carries the slug, not
 * the numeric ID. The UI surfaces a help message in that case.
 */
export const extractCompanyId = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Raw numeric ID. LinkedIn company IDs are 5–12 digits in practice.
  if (/^\d{5,12}$/.test(trimmed)) return trimmed;

  // URN form, with or without the "fsd_" prefix.
  const urn = trimmed.match(/urn:li:(?:fsd_)?company:(\d+)/);
  if (urn) return urn[1];

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  // Sales Navigator: /sales/company/<id>/...
  const sales = url.pathname.match(/\/sales\/company\/(\d+)/);
  if (sales) return sales[1];

  // Search URLs carry the ID inside JSON-ish array params.
  // URL.searchParams.get already URL-decodes the value, so we just
  // grep for the first run of digits.
  for (const param of ['currentCompany', 'pastCompany', 'f_C']) {
    const v = url.searchParams.get(param);
    if (v) {
      const m = v.match(/(\d+)/);
      if (m) return m[1];
    }
  }

  return null;
};

/**
 * Clean a LinkedIn slug into a plausible human label. Used as a fallback
 * when the user doesn't type a friendly label themselves.
 *
 * Heuristics (intentionally conservative — better to leave a slug as-is
 * than to mis-titleize a real name):
 *   - Strip the trailing "dotcom" pattern that LinkedIn uses when the
 *     base slug collides ("solace" → "solacedotcom"). Only stripped when
 *     something remains after.
 *   - Replace internal hyphens with spaces.
 *   - Title-case word boundaries.
 *
 * Examples:
 *   solacedotcom    → Solace
 *   acme-corp       → Acme Corp
 *   microsoft       → Microsoft
 *   ibm             → Ibm     (no good way to know this is an acronym)
 */
export const cleanSlugForLabel = (slug: string): string => {
  let s = slug;
  if (/^.+dotcom$/i.test(s)) {
    s = s.replace(/dotcom$/i, '');
  }
  s = s.replace(/-+/g, ' ').trim();
  if (!s) return slug;
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
};

/** Profile-token shape — `ACoAA...` followed by base64url chars.
 *  Used both to recognize tokens in input and to skip them when looking
 *  for a vanity (because both share the `/in/<segment>/` URL form). */
const PROFILE_TOKEN_RE = /^ACoA[A-Za-z0-9_-]{20,}$/;

/**
 * Extract the vanity from a `linkedin.com/in/<vanity>/...` URL.
 * Vanity is LinkedIn's term for the URL slug of a personal profile.
 * Returns null for non-LinkedIn URLs, LinkedIn URLs without `/in/`,
 * or `/in/<token>/` opaque-link URLs (those carry a profile token, not
 * a vanity — use `extractPersonToken` for those).
 */
export const extractPersonVanity = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    return null;
  }
  if (!/(^|\.)linkedin\.com$/.test(u.hostname)) return null;
  const m = u.pathname.match(/^\/in\/([^/]+)/);
  if (!m) return null;
  if (PROFILE_TOKEN_RE.test(m[1])) return null;
  return m[1];
};

/**
 * Extract the opaque LinkedIn profile token (`ACoAA…`) from any of the
 * forms a user might paste:
 *   - Raw token: `ACoAAABoeysBTY3vTs8r0yrVtG3s9NapWhiLs7U`
 *   - Profile URN: `urn:li:fsd_profile:<token>`
 *   - Opaque profile URL: `linkedin.com/in/<token>/`
 *   - Search URL with `fromMember=["<token>"]`
 *
 * The token is what LinkedIn's faceted-search `fromMember` filter now
 * requires; the legacy numeric URN form is silently dropped. Returns
 * null when no token is recoverable.
 */
export const extractPersonToken = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (PROFILE_TOKEN_RE.test(trimmed)) return trimmed;
  const urn = trimmed.match(/urn:li:fsd_profile:(ACoA[A-Za-z0-9_-]{20,})/);
  if (urn) return urn[1];
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (!/(^|\.)linkedin\.com$/.test(url.hostname)) return null;
  const path = url.pathname.match(/\/in\/(ACoA[A-Za-z0-9_-]{20,})/);
  if (path) return path[1];
  const fromMember = url.searchParams.get('fromMember');
  if (fromMember) {
    const m = fromMember.match(/(ACoA[A-Za-z0-9_-]{20,})/);
    if (m) return m[1];
  }
  return null;
};

/** Extract a numeric LinkedIn member ID from URL parameters or URN
 *  strings, mirroring `extractCompanyId` for the person case.
 *  Sources: raw numeric, urn:li:fsd_member:<id>, urn:li:member:<id>,
 *  Sales Nav lead URLs (`/sales/lead/<id>`). */
export const extractPersonId = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^\d{5,15}$/.test(trimmed)) return trimmed;
  const urn = trimmed.match(/urn:li:(?:fsd_)?member:(\d+)/);
  if (urn) return urn[1];
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  const sales = url.pathname.match(/\/sales\/lead\/(\d+)/);
  if (sales) return sales[1];
  return null;
};

/**
 * Extract the slug from a `linkedin.com/company/<slug>/...` URL.
 * The slug alone can't be used in a search URL — LinkedIn requires the
 * numeric ID. The UI uses this to give actionable guidance ("open the
 * People tab on LinkedIn for this slug, copy the resulting URL") when
 * a user pastes the most-instinctive URL form.
 */
export const extractCompanySlug = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    return null;
  }
  if (!/(^|\.)linkedin\.com$/.test(u.hostname)) return null;
  const m = u.pathname.match(/^\/company\/([^/]+)/);
  return m ? m[1] : null;
};
