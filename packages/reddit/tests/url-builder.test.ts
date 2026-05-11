import { describe, expect, it } from 'vitest';
import {
  buildCommentsQuery,
  buildCommentsUrl,
  buildFeedUrl,
  buildPostsQuery,
  buildPostsUrl,
  buildSubredditsUrl,
  buildUrl,
  buildUsersUrl,
  opAuthor,
  opSelfType,
  opSubreddit,
  qualifier,
  sanitizeSubName,
  sanitizeUsername,
} from '../src/lib/url-builder';
import { BUILTIN_TEMPLATES } from '../src/lib/templates';

const SEARCH_BASE = 'https://www.reddit.com/search/';
const ROOT = 'https://www.reddit.com';

const decodeQ = (url: string): string | null => {
  const u = new URL(url);
  const q = u.searchParams.get('q');
  return q;
};

// ─── encode helpers ──────────────────────────────────────────────────

describe('qualifier', () => {
  it('returns undefined for empty/whitespace input', () => {
    expect(qualifier('subreddit', undefined)).toBeUndefined();
    expect(qualifier('subreddit', '')).toBeUndefined();
    expect(qualifier('subreddit', '   ')).toBeUndefined();
  });

  it('emits unquoted form for tokens without whitespace', () => {
    expect(qualifier('subreddit', 'rust')).toBe('subreddit:rust');
  });

  it('quotes values containing whitespace', () => {
    expect(qualifier('flair', 'good first issue')).toBe(
      'flair:"good first issue"'
    );
  });
});

describe('opSubreddit', () => {
  it.each([
    ['rust', 'subreddit:rust'],
    ['r/rust', 'subreddit:rust'],
    ['/r/rust', 'subreddit:rust'],
    ['R/Rust', 'subreddit:Rust'],
  ])('strips leading r/ and emits qualifier (%s)', (input, expected) => {
    expect(opSubreddit(input)).toBe(expected);
  });
});

describe('opAuthor', () => {
  it.each([
    ['spez', 'author:spez'],
    ['u/spez', 'author:spez'],
    ['/u/spez', 'author:spez'],
    ['user/spez', 'author:spez'],
  ])('strips leading u/ or user/ (%s)', (input, expected) => {
    expect(opAuthor(input)).toBe(expected);
  });
});

describe('opSelfType', () => {
  it('emits self:yes for self', () => {
    expect(opSelfType('self')).toBe('self:yes');
  });
  it('emits self:no for link', () => {
    expect(opSelfType('link')).toBe('self:no');
  });
  it('returns undefined for undefined', () => {
    expect(opSelfType(undefined)).toBeUndefined();
  });
});

describe('sanitizeSubName / sanitizeUsername', () => {
  it('strips r/ prefix from sub name', () => {
    expect(sanitizeSubName(' r/rust ')).toBe('rust');
    expect(sanitizeSubName('rust')).toBe('rust');
  });
  it('strips u/ prefix from username', () => {
    expect(sanitizeUsername(' u/spez ')).toBe('spez');
    expect(sanitizeUsername('spez')).toBe('spez');
  });
});

// ─── posts ───────────────────────────────────────────────────────────

describe('buildPostsQuery', () => {
  it('returns empty for empty input', () => {
    expect(buildPostsQuery({})).toBe('');
  });

  it('keywords + subreddit + author compose with spaces', () => {
    const q = buildPostsQuery({
      keywords: 'python',
      subreddit: 'learnprogramming',
      author: 'spez',
    });
    expect(q).toBe('python subreddit:learnprogramming author:spez');
  });

  it('quotes flair containing spaces', () => {
    const q = buildPostsQuery({ flair: 'Show & Tell' });
    expect(q).toBe('flair:"Show & Tell"');
  });

  it('emits self:yes / self:no for self type', () => {
    expect(buildPostsQuery({ selfType: 'self' })).toBe('self:yes');
    expect(buildPostsQuery({ selfType: 'link' })).toBe('self:no');
  });

  it('emits site:domain for site filter', () => {
    expect(buildPostsQuery({ site: 'github.com' })).toBe('site:github.com');
  });

  it('emits url:value for url filter', () => {
    expect(buildPostsQuery({ url: 'arxiv.org/abs' })).toBe(
      'url:arxiv.org/abs'
    );
  });

  it('emits title: and selftext: qualifiers', () => {
    expect(buildPostsQuery({ title: 'release', selftext: 'breaking' })).toBe(
      'title:release selftext:breaking'
    );
  });
});

describe('buildPostsUrl', () => {
  it('empty input → results URL with type=link only', () => {
    const url = buildPostsUrl({});
    expect(url).toBe(`${SEARCH_BASE}?type=link`);
  });

  it('keywords-only URL has decoded q matching input', () => {
    const url = buildPostsUrl({ keywords: 'python tutorial' });
    expect(decodeQ(url)).toBe('python tutorial');
    expect(new URL(url).searchParams.get('type')).toBe('link');
  });

  it('full input emits sort, t, include_over_18', () => {
    const url = buildPostsUrl({
      keywords: 'rust',
      subreddit: 'rust',
      sort: 'top',
      time: 'week',
      includeOver18: true,
    });
    const u = new URL(url);
    expect(u.searchParams.get('q')).toBe('rust subreddit:rust');
    expect(u.searchParams.get('type')).toBe('link');
    expect(u.searchParams.get('sort')).toBe('top');
    expect(u.searchParams.get('t')).toBe('week');
    expect(u.searchParams.get('include_over_18')).toBe('on');
  });

  it('omits include_over_18 when false/undefined', () => {
    const url = buildPostsUrl({ keywords: 'x' });
    expect(new URL(url).searchParams.has('include_over_18')).toBe(false);
  });
});

// ─── comments ────────────────────────────────────────────────────────

describe('buildCommentsQuery / buildCommentsUrl', () => {
  it('empty input → q-less URL, type=comment', () => {
    const url = buildCommentsUrl({});
    expect(url).toBe(`${SEARCH_BASE}?type=comment`);
  });

  it('composes keywords + subreddit + author', () => {
    expect(
      buildCommentsQuery({ keywords: 'physics', subreddit: 'AskScience' })
    ).toBe('physics subreddit:AskScience');
  });

  it('emits sort + t', () => {
    const url = buildCommentsUrl({
      keywords: 'foo',
      sort: 'new',
      time: 'day',
    });
    const u = new URL(url);
    expect(u.searchParams.get('sort')).toBe('new');
    expect(u.searchParams.get('t')).toBe('day');
  });
});

// ─── subreddits ──────────────────────────────────────────────────────

describe('buildSubredditsUrl', () => {
  it('empty input → type=sr only', () => {
    expect(buildSubredditsUrl({})).toBe(`${SEARCH_BASE}?type=sr`);
  });

  it('keywords + sort + nsfw flag', () => {
    const url = buildSubredditsUrl({
      keywords: 'machine learning',
      sort: 'activity',
      includeOver18: true,
    });
    const u = new URL(url);
    expect(u.searchParams.get('q')).toBe('machine learning');
    expect(u.searchParams.get('type')).toBe('sr');
    expect(u.searchParams.get('sort')).toBe('activity');
    expect(u.searchParams.get('include_over_18')).toBe('on');
  });
});

// ─── users ───────────────────────────────────────────────────────────

describe('buildUsersUrl', () => {
  it('empty input → type=user only', () => {
    expect(buildUsersUrl({})).toBe(`${SEARCH_BASE}?type=user`);
  });

  it('keywords + sort', () => {
    const url = buildUsersUrl({ keywords: 'climate', sort: 'activity' });
    const u = new URL(url);
    expect(u.searchParams.get('q')).toBe('climate');
    expect(u.searchParams.get('type')).toBe('user');
    expect(u.searchParams.get('sort')).toBe('activity');
  });
});

// ─── feed (the URL-shape switcher) ───────────────────────────────────

describe('buildFeedUrl', () => {
  it('no target → reddit homepage', () => {
    expect(buildFeedUrl({})).toBe(`${ROOT}/`);
    expect(buildFeedUrl({ sort: 'top' })).toBe(`${ROOT}/`);
  });

  it('single subreddit + hot → /r/rust/hot/', () => {
    const url = buildFeedUrl({
      target: { kind: 'subreddits', names: ['rust'] },
      sort: 'hot',
    });
    expect(url).toBe(`${ROOT}/r/rust/hot/`);
  });

  it('multireddit → /r/rust+golang+typescript/top/?t=week', () => {
    const url = buildFeedUrl({
      target: {
        kind: 'subreddits',
        names: ['rust', 'golang', 'typescript'],
      },
      sort: 'top',
      time: 'week',
    });
    expect(url).toBe(`${ROOT}/r/rust+golang+typescript/top/?t=week`);
  });

  it('strips r/ prefixes from sub names in multireddit', () => {
    const url = buildFeedUrl({
      target: {
        kind: 'subreddits',
        names: ['r/rust', 'golang', '/r/python'],
      },
      sort: 'hot',
    });
    expect(url).toBe(`${ROOT}/r/rust+golang+python/hot/`);
  });

  it('global all + top + day → /r/all/top/?t=day', () => {
    const url = buildFeedUrl({
      target: { kind: 'global', scope: 'all' },
      sort: 'top',
      time: 'day',
    });
    expect(url).toBe(`${ROOT}/r/all/top/?t=day`);
  });

  it('global popular + hot → /r/popular/hot/', () => {
    const url = buildFeedUrl({
      target: { kind: 'global', scope: 'popular' },
      sort: 'hot',
    });
    expect(url).toBe(`${ROOT}/r/popular/hot/`);
  });

  it('user submitted feed → /user/<u>/submitted/?sort=top&t=year', () => {
    const url = buildFeedUrl({
      target: { kind: 'user', username: 'spez', tab: 'submitted' },
      sort: 'top',
      time: 'year',
    });
    expect(url).toBe(`${ROOT}/user/spez/submitted/?sort=top&t=year`);
  });

  it('user comments feed → /user/<u>/comments/?sort=new', () => {
    const url = buildFeedUrl({
      target: { kind: 'user', username: 'spez', tab: 'comments' },
      sort: 'new',
    });
    expect(url).toBe(`${ROOT}/user/spez/comments/?sort=new`);
  });

  it('drops t= when sort does not honor it (hot/new/rising)', () => {
    const url = buildFeedUrl({
      target: { kind: 'subreddits', names: ['rust'] },
      sort: 'hot',
      time: 'week',
    });
    expect(url).toBe(`${ROOT}/r/rust/hot/`);
    expect(url).not.toContain('t=');
  });

  it('keeps t= when sort=controversial', () => {
    const url = buildFeedUrl({
      target: { kind: 'subreddits', names: ['askreddit'] },
      sort: 'controversial',
      time: 'month',
    });
    expect(url).toBe(`${ROOT}/r/askreddit/controversial/?t=month`);
  });

  it('emits geo_filter when set', () => {
    const url = buildFeedUrl({
      target: { kind: 'global', scope: 'popular' },
      sort: 'hot',
      geoFilter: 'US',
    });
    expect(url).toBe(`${ROOT}/r/popular/hot/?geo_filter=US`);
  });

  it('defaults to sort=hot when sort is omitted', () => {
    const url = buildFeedUrl({
      target: { kind: 'subreddits', names: ['rust'] },
    });
    expect(url).toBe(`${ROOT}/r/rust/hot/`);
  });

  it('blank multireddit names fall back to homepage', () => {
    const url = buildFeedUrl({
      target: { kind: 'subreddits', names: ['', '  '] },
      sort: 'hot',
    });
    expect(url).toBe(`${ROOT}/`);
  });
});

// ─── dispatcher + templates ──────────────────────────────────────────

describe('buildUrl dispatcher', () => {
  it('posts branch → reddit search URL', () => {
    const url = buildUrl({ type: 'posts', input: { keywords: 'x' } });
    expect(new URL(url).hostname).toBe('www.reddit.com');
    expect(new URL(url).pathname).toBe('/search/');
  });

  it('feed branch → listing URL', () => {
    const url = buildUrl({
      type: 'feed',
      input: { target: { kind: 'subreddits', names: ['rust'] }, sort: 'hot' },
    });
    expect(url).toBe(`${ROOT}/r/rust/hot/`);
  });

  it('special branch passes through', () => {
    const u = 'https://www.reddit.com/message/inbox/';
    expect(buildUrl({ type: 'special', url: u })).toBe(u);
  });
});

describe('built-in templates', () => {
  it('every template produces a reddit.com URL', () => {
    for (const t of BUILTIN_TEMPLATES) {
      const url = buildUrl(t.search);
      const parsed = new URL(url);
      expect(['reddit.com', 'www.reddit.com']).toContain(parsed.hostname);
    }
  });

  it('every template has a unique id', () => {
    const ids = BUILTIN_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('templates cover every group at least once', () => {
    const groups = new Set(BUILTIN_TEMPLATES.map((t) => t.group));
    // Personal, Listings, Topics, Scoped, Discover
    expect(groups.size).toBeGreaterThanOrEqual(5);
  });
});
