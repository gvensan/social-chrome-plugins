import type { YouTubeFilterPreset } from './types';

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

// Pre-URL-encoded `sp=` tokens for each preset. The `%3D` characters are
// the `=` padding from base64, already escaped — emit straight without
// re-encoding.
const SP_TOKEN: Record<Exclude<YouTubeFilterPreset, 'none'>, string> = {
  'today': 'EgIIAg%3D%3D',
  'this-week': 'EgIIAw%3D%3D',
  'this-month': 'EgIIBA%3D%3D',
  'this-year': 'EgIIBQ%3D%3D',
  'sort-upload-date': 'CAI%3D',
  'sort-view-count': 'CAM%3D',
  'sort-rating': 'CAE%3D',
  'short-videos': 'EgIYAQ%3D%3D',
  'long-videos': 'EgIYAg%3D%3D',
  'cc-license': 'EgIwAQ%3D%3D',
  'hd-only': 'EgIgAQ%3D%3D',
  'subtitles': 'EgIoAQ%3D%3D',
  'channels': 'EgIQAg%3D%3D',
  'playlists': 'EgIQAw%3D%3D',
  'movies': 'EgIQBA%3D%3D',
};

export const tokenForPreset = (
  preset: YouTubeFilterPreset | undefined
): string | undefined => {
  if (!preset || preset === 'none') return undefined;
  return SP_TOKEN[preset];
};
