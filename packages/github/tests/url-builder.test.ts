import { describe, expect, it } from 'vitest';
import {
  buildCodeUrl,
  buildIssuesUrl,
  buildPullRequestsUrl,
  buildRepositoriesUrl,
  buildUrl,
  buildUsersUrl,
  composeQ,
  qualifier,
} from '../src/lib/url-builder';
import { BUILTIN_TEMPLATES } from '../src/lib/templates';

const decodeQ = (url: string): string => {
  const u = new URL(url);
  return u.searchParams.get('q') ?? '';
};

describe('encode helpers', () => {
  it('qualifier returns key:value for simple values', () => {
    expect(qualifier('language', 'rust')).toBe('language:rust');
  });

  it('qualifier quotes values containing whitespace', () => {
    expect(qualifier('location', 'San Francisco')).toBe(
      'location:"San Francisco"'
    );
  });

  it('qualifier returns undefined for empty strings', () => {
    expect(qualifier('language', '')).toBeUndefined();
    expect(qualifier('language', '   ')).toBeUndefined();
    expect(qualifier('language', undefined)).toBeUndefined();
  });

  it('composeQ joins non-empty fragments with spaces', () => {
    expect(composeQ(['a', undefined, 'b', '', 'c'])).toBe('a b c');
  });
});

describe('buildRepositoriesUrl', () => {
  it('returns base search URL with no q for empty input', () => {
    expect(buildRepositoriesUrl()).toBe(
      'https://github.com/search?type=repositories'
    );
  });

  it('skips empty/whitespace fields', () => {
    expect(buildRepositoriesUrl({ keywords: '   ', user: '' })).toBe(
      'https://github.com/search?type=repositories'
    );
  });

  it('builds top-rust-repos URL', () => {
    const url = buildRepositoriesUrl({
      language: 'rust',
      stars: '>10000',
      sort: 'stars',
    });
    expect(decodeQ(url)).toBe('language:rust stars:>10000 sort:stars');
    expect(new URL(url).searchParams.get('type')).toBe('repositories');
  });

  it('combines keywords with qualifiers', () => {
    const url = buildRepositoriesUrl({
      keywords: 'graph database',
      language: 'rust',
    });
    expect(decodeQ(url)).toBe('graph database language:rust');
  });

  it('emits archived qualifier for true and false', () => {
    expect(decodeQ(buildRepositoriesUrl({ archived: true }))).toBe(
      'archived:true'
    );
    expect(decodeQ(buildRepositoriesUrl({ archived: false }))).toBe(
      'archived:false'
    );
  });

  it('emits topic and license qualifiers', () => {
    expect(
      decodeQ(buildRepositoriesUrl({ topic: 'llm', sort: 'stars' }))
    ).toBe('topic:llm sort:stars');
    expect(
      decodeQ(
        buildRepositoriesUrl({
          language: 'python',
          license: 'mit',
          stars: '>500',
        })
      )
    ).toBe('language:python license:mit stars:>500');
  });
});

describe('buildCodeUrl', () => {
  it('builds an in:file code search', () => {
    const url = buildCodeUrl({
      keywords: 'TODO',
      user: 'YourOrg',
      inFile: true,
    });
    expect(decodeQ(url)).toBe('TODO user:YourOrg in:file');
    expect(new URL(url).searchParams.get('type')).toBe('code');
  });

  it('omits in:file when not set', () => {
    const url = buildCodeUrl({ keywords: 'TODO' });
    expect(decodeQ(url)).toBe('TODO');
  });
});

describe('buildIssuesUrl', () => {
  it('always emits is:issue', () => {
    expect(decodeQ(buildIssuesUrl())).toBe('is:issue');
  });

  it('combines state and label', () => {
    const url = buildIssuesUrl({
      state: 'open',
      label: 'bug',
      repo: 'nodejs/node',
    });
    expect(decodeQ(url)).toBe(
      'is:issue is:open repo:nodejs/node label:bug'
    );
    expect(new URL(url).searchParams.get('type')).toBe('issues');
  });

  it('emits no:assignee + language for good-first-issues template shape', () => {
    const url = buildIssuesUrl({
      state: 'open',
      label: 'good first issue',
      unassigned: true,
      language: 'typescript',
      sort: 'updated',
    });
    expect(decodeQ(url)).toBe(
      'is:issue is:open language:typescript label:"good first issue" no:assignee sort:updated'
    );
  });
});

describe('buildPullRequestsUrl', () => {
  it('always emits is:pr', () => {
    expect(decodeQ(buildPullRequestsUrl())).toBe('is:pr');
  });

  it('emits review-requested:@me', () => {
    const url = buildPullRequestsUrl({ reviewRequested: '@me' });
    expect(decodeQ(url)).toBe('is:pr review-requested:@me');
  });

  it('emits draft:true', () => {
    expect(decodeQ(buildPullRequestsUrl({ draft: true }))).toBe(
      'is:pr draft:true'
    );
  });

  it('preserves order: keywords, is:pr, state, draft, repo', () => {
    const url = buildPullRequestsUrl({
      keywords: 'fix',
      state: 'open',
      draft: false,
      repo: 'a/b',
    });
    expect(decodeQ(url)).toBe('fix is:pr is:open draft:false repo:a/b');
    expect(new URL(url).searchParams.get('type')).toBe('pullrequests');
  });
});

describe('buildUsersUrl', () => {
  it('builds a location+language users search', () => {
    const url = buildUsersUrl({
      location: 'San Francisco',
      language: 'rust',
    });
    expect(decodeQ(url)).toBe('location:"San Francisco" language:rust');
    expect(new URL(url).searchParams.get('type')).toBe('users');
  });

  it('emits type qualifier for org', () => {
    const url = buildUsersUrl({ type: 'org' });
    expect(decodeQ(url)).toBe('type:org');
  });
});

describe('buildUrl dispatcher', () => {
  it('dispatches to repositories builder', () => {
    expect(buildUrl({ type: 'repositories', input: {} })).toBe(
      'https://github.com/search?type=repositories'
    );
  });

  it('dispatches to code builder', () => {
    expect(buildUrl({ type: 'code', input: {} })).toBe(
      'https://github.com/search?type=code'
    );
  });

  it('dispatches to issues builder', () => {
    expect(decodeQ(buildUrl({ type: 'issues', input: {} }))).toBe('is:issue');
  });

  it('dispatches to pullrequests builder', () => {
    expect(decodeQ(buildUrl({ type: 'pullrequests', input: {} }))).toBe(
      'is:pr'
    );
  });

  it('dispatches to users builder', () => {
    expect(buildUrl({ type: 'users', input: {} })).toBe(
      'https://github.com/search?type=users'
    );
  });

  it('passes special-type URLs through unchanged', () => {
    const url = 'https://github.com/trending/typescript?since=daily';
    expect(buildUrl({ type: 'special', url })).toBe(url);
  });
});

describe('built-in templates', () => {
  it('every template produces a valid URL on a github.com host', () => {
    for (const t of BUILTIN_TEMPLATES) {
      const url = buildUrl(t.search);
      const parsed = new URL(url);
      expect(parsed.hostname).toBe('github.com');
    }
  });

  it('every template has a unique id', () => {
    const ids = BUILTIN_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
