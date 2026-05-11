// HN Algolia URLs are simple `key=value` query strings. Some values
// (notably `numericFilters=`) need their commas preserved literally,
// which encodeURIComponent leaves alone — so this is straightforward.

export const encodeValue = (v: string): string => encodeURIComponent(v);

export const buildQuery = (
  pairs: ReadonlyArray<readonly [string, string | undefined]>
): string => {
  const parts: string[] = [];
  for (const [k, v] of pairs) {
    if (v === undefined || v === '') continue;
    parts.push(`${k}=${encodeValue(v)}`);
  }
  return parts.length === 0 ? '' : '?' + parts.join('&');
};

const trim = (v: string | undefined): string | undefined => {
  if (!v) return undefined;
  const t = v.trim();
  return t === '' ? undefined : t;
};

const stripLeadingAt = (v: string): string =>
  v.startsWith('@') ? v.slice(1) : v;

export const sanitizeAuthor = (
  v: string | undefined
): string | undefined => {
  const t = trim(v);
  return t === undefined ? undefined : stripLeadingAt(t);
};

// Build the comma-separated `numericFilters=` value. Returns undefined
// if neither floor is set, so the param is dropped entirely.
export const buildNumericFilters = (
  minPoints: number | undefined,
  minComments: number | undefined
): string | undefined => {
  const parts: string[] = [];
  if (typeof minPoints === 'number' && minPoints > 0) {
    parts.push(`points>=${Math.floor(minPoints)}`);
  }
  if (typeof minComments === 'number' && minComments > 0) {
    parts.push(`num_comments>=${Math.floor(minComments)}`);
  }
  return parts.length === 0 ? undefined : parts.join(',');
};

export const trimOpt = trim;
