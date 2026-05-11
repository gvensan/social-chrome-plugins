import { describe, expect, it } from 'vitest';
import {
  buildQueryString,
  buildSearchUrl,
  buildUrl,
  filterForMode,
  opHashtag,
  opReplies,
  opMedia,
} from '../src/lib/url-builder';
import { BUILTIN_TEMPLATES } from '../src/lib/templates';

describe('encode helpers', () => {
  it('opHashtag normalizes a leading #', () => {
    expect(opHashtag('#AIagents')).toBe('#AIagents');
    expect(opHashtag('AIagents')).toBe('#AIagents');
    expect(opHashtag('   ')).toBeUndefined();
  });

  it('opReplies maps to filter:replies / -filter:replies / undefined', () => {
    expect(opReplies('include')).toBeUndefined();
    expect(opReplies('only')).toBe('filter:replies');
    expect(opReplies('exclude')).toBe('-filter:replies');
    expect(opReplies(undefined)).toBeUndefined();
  });

  it('opMedia maps to the corresponding filter operator', () => {
    expect(opMedia('any')).toBeUndefined();
    expect(opMedia('images')).toBe('filter:images');
    expect(opMedia('videos')).toBe('filter:videos');
    expect(opMedia('links')).toBe('filter:links');
  });

  it('filterForMode maps modes to the f= value', () => {
    expect(filterForMode('top')).toBeUndefined();
    expect(filterForMode('latest')).toBe('live');
    expect(filterForMode('people')).toBe('user');
    expect(filterForMode('media')).toBe('image');
  });
});

describe('buildQueryString', () => {
  it('empty input → empty string', () => {
    expect(buildQueryString({ mode: 'top' })).toBe('');
  });

  it('joins operators with single spaces and skips blanks', () => {
    const q = buildQueryString({
      mode: 'top',
      keywords: 'AI agents',
      fromUser: 'elonmusk',
      since: '2024-01-01',
      minFaves: 100,
      language: 'en',
    });
    expect(q).toBe(
      'AI agents from:elonmusk since:2024-01-01 min_faves:100 lang:en'
    );
  });

  it('strips leading @ on usernames', () => {
    const q = buildQueryString({ mode: 'top', fromUser: '@elonmusk' });
    expect(q).toBe('from:elonmusk');
  });

  it('strips leading # on hashtags', () => {
    const q = buildQueryString({ mode: 'top', hashtag: '#AIagents' });
    expect(q).toBe('#AIagents');
  });

  it('emits filter operators per option', () => {
    const q = buildQueryString({
      mode: 'top',
      filterReplies: 'exclude',
      filterMedia: 'videos',
      verifiedOnly: true,
    });
    expect(q).toBe('-filter:replies filter:videos filter:verified');
  });

  it('emits -filter:retweets when excludeRetweets is true', () => {
    const q = buildQueryString({
      mode: 'latest',
      keywords: 'AI agents',
      excludeRetweets: true,
    });
    expect(q).toBe('AI agents -filter:retweets');
  });

  it('omits -filter:retweets when excludeRetweets is undefined or false', () => {
    expect(
      buildQueryString({ mode: 'latest', keywords: 'AI', excludeRetweets: false })
    ).toBe('AI');
    expect(buildQueryString({ mode: 'latest', keywords: 'AI' })).toBe('AI');
  });

  it('omits zero or negative engagement floors', () => {
    const q = buildQueryString({
      mode: 'top',
      minFaves: 0,
      minRetweets: -1,
      minReplies: 5,
    });
    expect(q).toBe('min_replies:5');
  });
});

describe('buildSearchUrl', () => {
  it('empty input → URL with just src=typed_query', () => {
    expect(buildSearchUrl({ mode: 'top' })).toBe(
      'https://x.com/search?src=typed_query'
    );
  });

  it('uses x.com hostname', () => {
    const url = buildSearchUrl({ mode: 'top', keywords: 'hi' });
    expect(new URL(url).hostname).toBe('x.com');
  });

  it('omits f for top mode', () => {
    const url = buildSearchUrl({ mode: 'top', keywords: 'hi' });
    expect(url).not.toContain('&f=');
  });

  it('appends f=live for latest', () => {
    const url = buildSearchUrl({ mode: 'latest', keywords: 'hi' });
    expect(url).toContain('&f=live');
  });

  it('appends f=user for people mode', () => {
    const url = buildSearchUrl({ mode: 'people', keywords: 'climate' });
    expect(url).toContain('&f=user');
  });

  it('appends f=image for media mode', () => {
    const url = buildSearchUrl({ mode: 'media', keywords: 'sunset' });
    expect(url).toContain('&f=image');
  });

  it('URL-encodes the q-string and decodes back to the operator string', () => {
    const url = buildSearchUrl({
      mode: 'latest',
      keywords: 'AI agents',
      fromUser: 'elonmusk',
      minFaves: 100,
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get('q')).toBe(
      'AI agents from:elonmusk min_faves:100'
    );
    expect(parsed.searchParams.get('src')).toBe('typed_query');
    expect(parsed.searchParams.get('f')).toBe('live');
  });
});

describe('buildUrl dispatcher', () => {
  it('search branch produces an x.com URL', () => {
    const url = buildUrl({ type: 'search', input: { mode: 'top' } });
    expect(new URL(url).hostname).toBe('x.com');
  });

  it('special branch passes through unchanged', () => {
    expect(
      buildUrl({ type: 'special', url: 'https://x.com/i/bookmarks' })
    ).toBe('https://x.com/i/bookmarks');
  });
});

describe('built-in templates', () => {
  it('every template produces a URL on x.com', () => {
    for (const t of BUILTIN_TEMPLATES) {
      const url = buildUrl(t.search);
      const parsed = new URL(url);
      expect(parsed.hostname).toBe('x.com');
    }
  });

  it('every template has a unique id', () => {
    const ids = BUILTIN_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
