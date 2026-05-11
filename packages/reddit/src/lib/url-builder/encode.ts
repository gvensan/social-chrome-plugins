// Shared encoding helpers for the Reddit url-builder. Reddit's search
// uses a Lucene-style q= parameter — we compose qualifier fragments
// (subreddit:foo, author:bar, "exact phrase") and let URLSearchParams
// handle final escaping.

export const encodeValue = (v: string): string => encodeURIComponent(v);

export const buildQuery = (
  pairs: ReadonlyArray<readonly [string, string | undefined]>
): string => {
  const parts: string[] = [];
  for (const [k, v] of pairs) {
    if (v === undefined || v === '') continue;
    parts.push(`${k}=${v}`);
  }
  return parts.length === 0 ? '' : '?' + parts.join('&');
};

// Compose a Reddit q= string from an ordered list of fragments. Free
// keywords belong at the head; qualifiers (subreddit:foo, author:bar)
// follow. Empty/undefined fragments are dropped.
export const composeQ = (
  fragments: ReadonlyArray<string | undefined>
): string => fragments.filter((f): f is string => !!f && f.length > 0).join(' ');

const stripPrefix = (v: string, ...prefixes: string[]): string => {
  for (const p of prefixes) {
    if (v.toLowerCase().startsWith(p.toLowerCase())) return v.slice(p.length);
  }
  return v;
};

const trim = (v: string | undefined): string | undefined => {
  if (!v) return undefined;
  const t = v.trim();
  return t === '' ? undefined : t;
};

// `name:value` qualifier. Quotes the value when it contains whitespace
// so the qualifier doesn't get split by Reddit's query parser.
export const qualifier = (
  key: string,
  value: string | undefined
): string | undefined => {
  const t = trim(value);
  if (t === undefined) return undefined;
  return /\s/.test(t) ? `${key}:"${t}"` : `${key}:${t}`;
};

export const opSubreddit = (v: string | undefined): string | undefined => {
  const t = trim(v);
  if (t === undefined) return undefined;
  return qualifier('subreddit', stripPrefix(t, 'r/', '/r/'));
};

export const opAuthor = (v: string | undefined): string | undefined => {
  const t = trim(v);
  if (t === undefined) return undefined;
  return qualifier('author', stripPrefix(t, 'u/', '/u/', 'user/', '/user/'));
};

export const opSelfType = (
  v: 'self' | 'link' | undefined
): string | undefined => {
  if (!v) return undefined;
  return v === 'self' ? 'self:yes' : 'self:no';
};

// Sanitize a subreddit name for use in a path segment. Strips leading
// `r/` / `/r/`, removes whitespace; preserves underscore + alnum which
// are the only chars Reddit allows in a sub name.
export const sanitizeSubName = (name: string): string =>
  stripPrefix(name.trim(), 'r/', '/r/').trim();

// Sanitize a username for path use — strips a `u/` prefix.
export const sanitizeUsername = (name: string): string =>
  stripPrefix(name.trim(), 'u/', '/u/', 'user/', '/user/').trim();
