export const encodeValue = (v: string): string => encodeURIComponent(v);

export const encodeJsonArray = (values: ReadonlyArray<string>): string => {
  const json = '[' + values.map((v) => `"${v}"`).join(',') + ']';
  return encodeURIComponent(json);
};

export const encodeQuoted = (v: string): string =>
  encodeURIComponent(`"${v}"`);

export const encodeCsv = (values: ReadonlyArray<string | number>): string =>
  values.join('%2C');

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

const STRIP_PARAMS = new Set([
  'sid',
  'trk',
  'origin',
  'sessionRedirect',
  'midToken',
  'midSig',
  'trkEmail',
  'eid',
]);

export const stripSessionParams = (url: string): string => {
  try {
    const u = new URL(url);
    for (const k of [...u.searchParams.keys()]) {
      if (STRIP_PARAMS.has(k)) u.searchParams.delete(k);
    }
    return u.toString();
  } catch {
    return url;
  }
};
