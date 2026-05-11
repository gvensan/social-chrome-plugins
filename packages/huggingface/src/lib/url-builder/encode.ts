// Hugging Face URLs are simple `?key=value` query strings — no compound
// q= field like Reddit, no sp= encoding like YouTube. We just compose
// pairs and let URLSearchParams handle escaping.

export const encodeValue = (v: string): string => encodeURIComponent(v);

const trim = (v: string | undefined): string | undefined => {
  if (!v) return undefined;
  const t = v.trim();
  return t === '' ? undefined : t;
};

export interface QueryPair {
  /** Param key (e.g. "pipeline_tag"). */
  key: string;
  /** Already-trimmed value. Caller is responsible for trim/normalisation. */
  value: string;
}

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

// Some HF parameters can repeat — `other=tag1&other=tag2` accumulates
// filter tags in an AND fashion. This helper expands an array into the
// pair list the buildQuery encoder expects.
export const repeatParam = (
  key: string,
  values: ReadonlyArray<string> | undefined
): Array<readonly [string, string | undefined]> => {
  if (!values || values.length === 0) return [];
  return values
    .map((v) => trim(v))
    .filter((v): v is string => v !== undefined)
    .map((v) => [key, v] as const);
};

// Strip a leading `@` if the user pasted an @-handle in author fields.
const stripLeadingAt = (v: string): string =>
  v.startsWith('@') ? v.slice(1) : v;

// Sanitize an author/org slug — strips leading `@`, leading slash,
// and a trailing slash. Preserves the slug shape HF expects in URLs.
export const sanitizeSlug = (v: string | undefined): string | undefined => {
  const t = trim(v);
  if (t === undefined) return undefined;
  let s = stripLeadingAt(t);
  if (s.startsWith('/')) s = s.slice(1);
  if (s.endsWith('/')) s = s.slice(0, -1);
  return s.length > 0 ? s : undefined;
};

// Normalise a license slug. HF licenses are lowercase with hyphens
// (apache-2.0, mit, llama2, cc-by-4.0). We don't transform — just
// trim — but keep a hook for future normalisation.
export const normaliseLicense = (
  v: string | undefined
): string | undefined => trim(v);

export const trimOpt = trim;
