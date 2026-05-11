import { describe, expect, it } from 'vitest';
import {
  buildNumericFilters,
  buildSearchUrl,
  buildUrl,
  sanitizeAuthor,
} from '../src/lib/url-builder';
import { BUILTIN_TEMPLATES } from '../src/lib/templates';

const HOST = 'hn.algolia.com';
const ROOT = 'https://hn.algolia.com/';

const sp = (url: string) => new URL(url).searchParams;

// ─── encode helpers ──────────────────────────────────────────────────

describe('sanitizeAuthor', () => {
  it('strips leading @', () => {
    expect(sanitizeAuthor('@pg')).toBe('pg');
    expect(sanitizeAuthor('pg')).toBe('pg');
  });
  it('returns undefined for empty / whitespace', () => {
    expect(sanitizeAuthor(undefined)).toBeUndefined();
    expect(sanitizeAuthor('')).toBeUndefined();
    expect(sanitizeAuthor('   ')).toBeUndefined();
  });
});

describe('buildNumericFilters', () => {
  it('returns undefined when both floors are absent', () => {
    expect(buildNumericFilters(undefined, undefined)).toBeUndefined();
    expect(buildNumericFilters(0, 0)).toBeUndefined();
  });
  it('emits a points filter alone', () => {
    expect(buildNumericFilters(100, undefined)).toBe('points>=100');
  });
  it('emits a comments filter alone', () => {
    expect(buildNumericFilters(undefined, 50)).toBe('num_comments>=50');
  });
  it('comma-joins both filters when both set', () => {
    expect(buildNumericFilters(500, 100)).toBe(
      'points>=500,num_comments>=100'
    );
  });
  it('floors fractional values', () => {
    expect(buildNumericFilters(99.7, 14.4)).toBe(
      'points>=99,num_comments>=14'
    );
  });
});

// ─── buildSearchUrl ─────────────────────────────────────────────────

describe('buildSearchUrl', () => {
  it('empty input → bare hn.algolia.com URL', () => {
    expect(buildSearchUrl({})).toBe(ROOT);
  });

  it('keywords-only emits ?query=', () => {
    const url = buildSearchUrl({ keywords: 'rust' });
    expect(sp(url).get('query')).toBe('rust');
    expect(sp(url).has('type')).toBe(false);
  });

  it('full input emits each parameter', () => {
    const url = buildSearchUrl({
      keywords: 'ai agents',
      type: 'story',
      sort: 'byPopularity',
      dateRange: 'pastMonth',
      author: '@pg',
      minPoints: 100,
      minComments: 20,
    });
    const u = sp(url);
    expect(u.get('query')).toBe('ai agents');
    expect(u.get('type')).toBe('story');
    expect(u.get('sort')).toBe('byPopularity');
    expect(u.get('dateRange')).toBe('pastMonth');
    expect(u.get('author')).toBe('pg');
    expect(u.get('numericFilters')).toBe(
      'points>=100,num_comments>=20'
    );
  });

  it("dateRange='custom' emits dateStart + dateEnd", () => {
    const url = buildSearchUrl({
      dateRange: 'custom',
      dateStart: 1_700_000_000,
      dateEnd: 1_710_000_000,
    });
    const u = sp(url);
    expect(u.get('dateRange')).toBe('custom');
    expect(u.get('dateStart')).toBe('1700000000');
    expect(u.get('dateEnd')).toBe('1710000000');
  });

  it("non-custom dateRange drops dateStart/dateEnd", () => {
    const url = buildSearchUrl({
      dateRange: 'pastWeek',
      dateStart: 1_700_000_000,
      dateEnd: 1_710_000_000,
    });
    const u = sp(url);
    expect(u.get('dateRange')).toBe('pastWeek');
    expect(u.has('dateStart')).toBe(false);
    expect(u.has('dateEnd')).toBe(false);
  });

  it('omits prefix when default (true / undefined)', () => {
    expect(sp(buildSearchUrl({})).has('prefix')).toBe(false);
    expect(
      sp(buildSearchUrl({ prefix: true })).has('prefix')
    ).toBe(false);
  });

  it('emits prefix=false when explicitly disabled', () => {
    expect(sp(buildSearchUrl({ prefix: false })).get('prefix')).toBe(
      'false'
    );
  });

  it('zero/negative engagement floors are dropped', () => {
    const url = buildSearchUrl({ minPoints: 0, minComments: -5 });
    expect(sp(url).has('numericFilters')).toBe(false);
  });

  it('all six type values pass through', () => {
    for (const t of [
      'all',
      'story',
      'comment',
      'ask_hn',
      'show_hn',
      'poll',
      'job',
    ] as const) {
      expect(sp(buildSearchUrl({ type: t })).get('type')).toBe(t);
    }
  });

  it('storyId emits as storyId=', () => {
    const url = buildSearchUrl({ storyId: '12345', type: 'comment' });
    expect(sp(url).get('storyId')).toBe('12345');
    expect(sp(url).get('type')).toBe('comment');
  });
});

// ─── dispatcher + templates ─────────────────────────────────────────

describe('buildUrl dispatcher', () => {
  it('search branch → hn.algolia.com URL', () => {
    const url = buildUrl({ type: 'search', input: { keywords: 'x' } });
    expect(new URL(url).hostname).toBe(HOST);
  });

  it('special branch passes through', () => {
    const u = 'https://news.ycombinator.com/news';
    expect(buildUrl({ type: 'special', url: u })).toBe(u);
  });
});

describe('built-in templates', () => {
  it('every template produces a known HN URL host', () => {
    const allowed = ['hn.algolia.com', 'news.ycombinator.com'];
    for (const t of BUILTIN_TEMPLATES) {
      const url = buildUrl(t.search);
      const parsed = new URL(url);
      expect(allowed).toContain(parsed.hostname);
    }
  });

  it('every template has a unique id', () => {
    const ids = BUILTIN_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('templates cover at least four groups', () => {
    const groups = new Set(BUILTIN_TEMPLATES.map((t) => t.group));
    // Live, Posts, Topics, Authors
    expect(groups.size).toBeGreaterThanOrEqual(4);
  });
});
