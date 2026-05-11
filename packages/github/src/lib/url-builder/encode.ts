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

// Compose a GitHub search query string from an ordered list of qualifier
// fragments. Empty/undefined fragments are skipped. Free-text keywords
// belong at the head; qualifiers (e.g. `language:rust`) follow.
export const composeQ = (
  fragments: ReadonlyArray<string | undefined>
): string => fragments.filter((f): f is string => !!f && f.length > 0).join(' ');

export const qualifier = (
  key: string,
  value: string | undefined
): string | undefined => {
  if (value === undefined) return undefined;
  const v = value.trim();
  if (!v) return undefined;
  // Quote values containing whitespace so the qualifier survives encoding.
  return /\s/.test(v) ? `${key}:"${v}"` : `${key}:${v}`;
};

export const flag = (
  key: string,
  value: string | undefined
): string | undefined => {
  if (value === undefined) return undefined;
  const v = value.trim();
  if (!v) return undefined;
  return `${key}:${v}`;
};

export const buildSearchUrl = (q: string, type: string): string => {
  const pairs: Array<readonly [string, string | undefined]> = [
    ['q', q ? encodeValue(q) : undefined],
    ['type', type] as const,
  ];
  return 'https://github.com/search' + buildQuery(pairs);
};
