import { describe, expect, it } from 'vitest';
import {
  buildSearchUrl,
  buildUrl,
  tokenForPreset,
  type YouTubeFilterPreset,
} from '../src/lib/url-builder';
import { BUILTIN_TEMPLATES } from '../src/lib/templates';

const ALL_PRESETS: ReadonlyArray<YouTubeFilterPreset> = [
  'none',
  'today',
  'this-week',
  'this-month',
  'this-year',
  'sort-upload-date',
  'sort-view-count',
  'sort-rating',
  'short-videos',
  'long-videos',
  'cc-license',
  'hd-only',
  'subtitles',
  'channels',
  'playlists',
  'movies',
];

const EXPECTED_TOKEN: Record<Exclude<YouTubeFilterPreset, 'none'>, string> = {
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

describe('tokenForPreset', () => {
  it('returns undefined for none', () => {
    expect(tokenForPreset('none')).toBeUndefined();
    expect(tokenForPreset(undefined)).toBeUndefined();
  });

  it.each(
    Object.entries(EXPECTED_TOKEN) as Array<
      [Exclude<YouTubeFilterPreset, 'none'>, string]
    >
  )('emits the correct token for preset %s', (preset, expected) => {
    expect(tokenForPreset(preset)).toBe(expected);
  });
});

describe('buildSearchUrl', () => {
  it('empty input → results URL with no params', () => {
    expect(buildSearchUrl({})).toBe('https://www.youtube.com/results');
  });

  it('keywords only → URL with encoded search_query', () => {
    const url = buildSearchUrl({ keywords: 'python tutorial' });
    expect(url).toBe(
      'https://www.youtube.com/results?search_query=python%20tutorial'
    );
    expect(new URL(url).hostname).toBe('www.youtube.com');
    expect(new URL(url).searchParams.get('search_query')).toBe(
      'python tutorial'
    );
  });

  it('keywords + preset → URL with both params', () => {
    const url = buildSearchUrl({
      keywords: 'python tutorial',
      preset: 'this-week',
    });
    expect(url).toBe(
      'https://www.youtube.com/results?search_query=python%20tutorial&sp=EgIIAw%3D%3D'
    );
  });

  it('preset only → URL with sp= but no search_query', () => {
    const url = buildSearchUrl({ preset: 'today' });
    expect(url).toBe('https://www.youtube.com/results?sp=EgIIAg%3D%3D');
  });

  it("preset 'none' → no sp= parameter", () => {
    const url = buildSearchUrl({ keywords: 'hi', preset: 'none' });
    expect(url).toBe('https://www.youtube.com/results?search_query=hi');
    expect(url).not.toContain('sp=');
  });

  it('blank keywords are omitted', () => {
    expect(buildSearchUrl({ keywords: '   ' })).toBe(
      'https://www.youtube.com/results'
    );
  });

  it('preserves the pre-encoded sp= token verbatim (no double-encoding)', () => {
    const url = buildSearchUrl({ keywords: 'a', preset: 'today' });
    expect(url).toContain('sp=EgIIAg%3D%3D');
    expect(url).not.toContain('%253D');
  });

  it.each(
    Object.entries(EXPECTED_TOKEN) as Array<
      [Exclude<YouTubeFilterPreset, 'none'>, string]
    >
  )('emits sp=%s for preset %s', (preset, expected) => {
    const url = buildSearchUrl({ keywords: 'x', preset });
    expect(url).toContain(`sp=${expected}`);
  });
});

describe('buildUrl dispatcher', () => {
  it('search branch produces a youtube.com URL', () => {
    const url = buildUrl({ type: 'search', input: { keywords: 'x' } });
    expect(new URL(url).hostname).toBe('www.youtube.com');
  });

  it('special branch passes through unchanged', () => {
    const u = 'https://www.youtube.com/feed/trending';
    expect(buildUrl({ type: 'special', url: u })).toBe(u);
  });

  it('special branch with arbitrary URL is untouched', () => {
    const u = 'https://www.youtube.com/feed/subscriptions';
    expect(buildUrl({ type: 'special', url: u })).toBe(u);
  });
});

describe('built-in templates', () => {
  it('every template produces a URL on a youtube.com host', () => {
    for (const t of BUILTIN_TEMPLATES) {
      const url = buildUrl(t.search);
      const parsed = new URL(url);
      expect(['youtube.com', 'www.youtube.com']).toContain(parsed.hostname);
    }
  });

  it('every template has a unique id', () => {
    const ids = BUILTIN_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('preset list covers every YouTubeFilterPreset value', () => {
    expect(ALL_PRESETS).toHaveLength(16);
  });
});
