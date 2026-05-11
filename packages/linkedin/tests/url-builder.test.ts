import { describe, expect, it } from 'vitest';
import {
  buildPeopleUrl,
  buildJobsUrl,
  buildPostsUrl,
  buildUrl,
  encodeJsonArray,
  encodeQuoted,
  stripSessionParams,
} from '../src/lib/url-builder';
import { BUILTIN_TEMPLATES } from '../src/lib/templates';

describe('encode helpers', () => {
  it('encodeJsonArray quotes values and URL-encodes brackets', () => {
    expect(encodeJsonArray(['first', 'following'])).toBe(
      '%5B%22first%22%2C%22following%22%5D'
    );
  });

  it('encodeQuoted wraps then URL-encodes', () => {
    expect(encodeQuoted('date_posted')).toBe('%22date_posted%22');
  });

  it('stripSessionParams removes sid and trk', () => {
    const url =
      'https://www.linkedin.com/jobs/search/?keywords=hi&sid=abc&trk=xyz';
    expect(stripSessionParams(url)).toBe(
      'https://www.linkedin.com/jobs/search/?keywords=hi'
    );
  });

  it('stripSessionParams returns input unchanged on invalid url', () => {
    expect(stripSessionParams('not a url')).toBe('not a url');
  });
});

describe('buildPostsUrl', () => {
  it('returns base URL with no params for empty input', () => {
    expect(buildPostsUrl()).toBe(
      'https://www.linkedin.com/search/results/content/'
    );
  });

  it('skips undefined and empty fields', () => {
    expect(buildPostsUrl({ keywords: '   ', sort: undefined })).toBe(
      'https://www.linkedin.com/search/results/content/'
    );
  });

  it('builds a network 24h URL with array-form sortBy/datePosted and origin', () => {
    const url = buildPostsUrl({
      sort: 'date_posted',
      datePosted: 'past-24h',
      postedBy: ['first', 'following'],
    });
    expect(url).toBe(
      'https://www.linkedin.com/search/results/content/' +
        '?origin=FACETED_SEARCH' +
        '&sortBy=%5B%22date_posted%22%5D' +
        '&datePosted=%5B%22past-24h%22%5D' +
        '&postedBy=%5B%22first%22%2C%22following%22%5D'
    );
  });

  it('encodes keyword spaces as %20', () => {
    const url = buildPostsUrl({ keywords: 'AI engineering' });
    expect(url).toContain('keywords=AI%20engineering');
  });

  it('emits origin=FACETED_SEARCH whenever any facet filter is set', () => {
    const url = buildPostsUrl({ postedBy: ['first', 'following'] });
    expect(url).toContain('origin=FACETED_SEARCH');
  });

  it('omits origin for keywords-only searches', () => {
    const url = buildPostsUrl({ keywords: 'AI' });
    expect(url).not.toContain('origin=');
  });

  it('omits origin for the empty input', () => {
    expect(buildPostsUrl()).not.toContain('origin=');
  });

  it('emits content type as contentType array (plural)', () => {
    const url = buildPostsUrl({ contentType: 'videos' });
    expect(decodeURIComponent(url)).toContain('contentType=["videos"]');
  });

  it('uses "photos" for the Images content type', () => {
    const url = buildPostsUrl({ contentType: 'photos' });
    expect(decodeURIComponent(url)).toContain('contentType=["photos"]');
  });

  it('uses "documents" for the Documents content type', () => {
    const url = buildPostsUrl({ contentType: 'documents' });
    expect(decodeURIComponent(url)).toContain('contentType=["documents"]');
  });

  it('omits datePosted when "any"', () => {
    const url = buildPostsUrl({ datePosted: 'any', sort: 'date_posted' });
    expect(url).not.toContain('datePosted');
  });

  it('emits fromOrganization as JSON array of IDs', () => {
    const url = buildPostsUrl({ fromOrganizationIds: ['20219'] });
    expect(decodeURIComponent(url)).toContain('fromOrganization=["20219"]');
  });

  it('merges company keyword fallback into the keywords field', () => {
    const url = buildPostsUrl({
      keywords: 'product launch',
      companyKeywords: ['Solace'],
    });
    expect(decodeURIComponent(url)).toContain(
      'keywords=product launch "Solace"'
    );
  });

  it('emits both fromOrganization and keyword fallback (hybrid)', () => {
    const url = buildPostsUrl({
      sort: 'date_posted',
      datePosted: 'past-week',
      fromOrganizationIds: ['20219'],
      companyKeywords: ['Solace'],
    });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('keywords="Solace"');
    expect(decoded).toContain('fromOrganization=["20219"]');
    expect(decoded).toContain('sortBy=["date_posted"]');
    expect(decoded).toContain('datePosted=["past-week"]');
  });

  it('merges person keywords into the keywords field', () => {
    const url = buildPostsUrl({
      keywords: 'climate',
      personKeywords: ['Bill Gates'],
    });
    expect(decodeURIComponent(url)).toContain(
      'keywords=climate "Bill Gates"'
    );
  });

  it('combines company and person keywords with OR-grouping', () => {
    const url = buildPostsUrl({
      companyKeywords: ['Solace'],
      personKeywords: ['Bill Gates'],
    });
    expect(decodeURIComponent(url)).toContain(
      'keywords=("Solace" OR "Bill Gates")'
    );
  });

  it('hybrid: emits all three (keywords + fromOrganization + fromMember)', () => {
    const url = buildPostsUrl({
      keywords: 'AI',
      fromOrganizationIds: ['20219'],
      fromMemberTokens: ['ACoAAABoeysBTY3vTs8r0yrVtG3s9NapWhiLs7U'],
      companyKeywords: ['Solace'],
      personKeywords: ['Bill Gates'],
    });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('keywords=AI ("Solace" OR "Bill Gates")');
    expect(decoded).toContain('fromOrganization=["20219"]');
    expect(decoded).toContain(
      'fromMember=["ACoAAABoeysBTY3vTs8r0yrVtG3s9NapWhiLs7U"]'
    );
  });

  it('emits fromMember as bare profile-token JSON array', () => {
    const url = buildPostsUrl({
      fromMemberTokens: ['ACoAAABoeysBTY3vTs8r0yrVtG3s9NapWhiLs7U'],
    });
    expect(decodeURIComponent(url)).toContain(
      'fromMember=["ACoAAABoeysBTY3vTs8r0yrVtG3s9NapWhiLs7U"]'
    );
  });
});

describe('buildJobsUrl', () => {
  it('builds a fresh remote jobs URL with origin tag', () => {
    const url = buildJobsUrl({
      recency: '1h',
      sort: 'DD',
      workplaceTypes: [3],
      easyApply: true,
    });
    expect(url).toBe(
      'https://www.linkedin.com/jobs/search/' +
        '?origin=JOB_SEARCH_PAGE_JOB_FILTER' +
        '&f_TPR=r3600' +
        '&sortBy=DD' +
        '&f_WT=3' +
        '&f_EA=true'
    );
  });

  it('emits multi-select CSV for workplace types', () => {
    const url = buildJobsUrl({ workplaceTypes: [1, 2, 3] });
    expect(url).toContain('f_WT=1%2C2%2C3');
  });

  it('omits boolean filters when false', () => {
    const url = buildJobsUrl({
      recency: '24h',
      easyApply: false,
      underTenApplicants: false,
      hasVerifications: false,
    });
    expect(url).not.toContain('f_EA');
    expect(url).not.toContain('f_AL');
    expect(url).not.toContain('f_VJ');
  });

  it('emits f_F (CSV) for job functions', () => {
    const url = buildJobsUrl({ jobFunctions: ['it', 'bd'] });
    expect(url).toContain('f_F=it%2Cbd');
  });

  it('emits f_VJ for hasVerifications', () => {
    const url = buildJobsUrl({ hasVerifications: true });
    expect(url).toContain('f_VJ=true');
  });

  it('emits f_AL for underTenApplicants', () => {
    const url = buildJobsUrl({ underTenApplicants: true });
    expect(url).toContain('f_AL=true');
  });

  it('emits origin=JOB_SEARCH_PAGE_JOB_FILTER when any facet is set', () => {
    expect(buildJobsUrl({ easyApply: true })).toContain(
      'origin=JOB_SEARCH_PAGE_JOB_FILTER'
    );
  });

  it('omits origin for keywords-only / empty input', () => {
    expect(buildJobsUrl({ keywords: 'AI' })).not.toContain('origin=');
    expect(buildJobsUrl()).not.toContain('origin=');
  });

  it('handles all recency presets', () => {
    expect(buildJobsUrl({ recency: '15min' })).toContain('f_TPR=r900');
    expect(buildJobsUrl({ recency: '30min' })).toContain('f_TPR=r1800');
    expect(buildJobsUrl({ recency: '1h' })).toContain('f_TPR=r3600');
    expect(buildJobsUrl({ recency: '24h' })).toContain('f_TPR=r86400');
    expect(buildJobsUrl({ recency: 'week' })).toContain('f_TPR=r604800');
    expect(buildJobsUrl({ recency: 'month' })).toContain('f_TPR=r2592000');
    expect(buildJobsUrl({ recency: 'any' })).not.toContain('f_TPR');
  });

  it('emits f_C as CSV for single and multiple company IDs', () => {
    expect(buildJobsUrl({ companyIds: ['20219'] })).toContain('f_C=20219');
    expect(
      buildJobsUrl({ companyIds: ['20219', '9876543'] })
    ).toContain('f_C=20219%2C9876543');
  });

  it('merges company keyword fallback into the keywords field', () => {
    const url = buildJobsUrl({
      keywords: 'engineer',
      companyKeywords: ['Solace'],
    });
    expect(decodeURIComponent(url)).toContain('keywords=engineer "Solace"');
  });

  it('emits both f_C and keyword fallback in hybrid form', () => {
    const url = buildJobsUrl({
      companyIds: ['20219'],
      companyKeywords: ['Solace'],
      recency: 'week',
      sort: 'DD',
      inYourNetwork: true,
    });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('keywords="Solace"');
    expect(decoded).toContain('f_C=20219');
    expect(decoded).toContain('f_TPR=r604800');
    expect(decoded).toContain('sortBy=DD');
    expect(decoded).toContain('f_JIYN=true');
  });
});

describe('buildPeopleUrl', () => {
  it('builds a people-by-title URL', () => {
    const url = buildPeopleUrl({
      keywords: 'product manager',
      network: ['F', 'S'],
    });
    expect(url).toBe(
      'https://www.linkedin.com/search/results/people/' +
        '?keywords=product%20manager' +
        '&network=%5B%22F%22%2C%22S%22%5D'
    );
  });

  it('emits currentCompany filter when ID is supplied', () => {
    const url = buildPeopleUrl({
      currentCompanyIds: ['1234567'],
      pastCompanyIds: ['1234567'],
    });
    expect(decodeURIComponent(url)).toContain('currentCompany=["1234567"]');
    expect(decodeURIComponent(url)).toContain('pastCompany=["1234567"]');
  });

  it('falls back to keyword OR-expression for slug-based companies', () => {
    const url = buildPeopleUrl({
      currentCompanyKeywords: ['Solace'],
    });
    expect(decodeURIComponent(url)).toContain('keywords="Solace"');
  });

  it('combines user keywords with company keywords using AND', () => {
    const url = buildPeopleUrl({
      keywords: 'engineer',
      currentCompanyKeywords: ['Solace', 'Acme Corp'],
      pastCompanyKeywords: ['Stripe'],
    });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain(
      'keywords=engineer ("Solace" OR "Acme Corp" OR "Stripe")'
    );
  });

  it('omits keywords param entirely when nothing supplied', () => {
    const url = buildPeopleUrl({});
    expect(url).not.toContain('keywords=');
  });

  it('drops empty company-keyword strings', () => {
    const url = buildPeopleUrl({
      currentCompanyKeywords: ['', '  ', 'Solace'],
    });
    expect(decodeURIComponent(url)).toContain('keywords="Solace"');
  });

  it('dedups same label across current + past buckets', () => {
    const url = buildPeopleUrl({
      currentCompanyKeywords: ['Solace'],
      pastCompanyKeywords: ['Solace'],
    });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('keywords="Solace"');
    expect(decoded).not.toContain('OR');
  });

  it('hybrid: emits both currentCompany ID and keyword fallback', () => {
    const url = buildPeopleUrl({
      keywords: 'Developer Advocate',
      network: ['F'],
      currentCompanyIds: ['20219'],
      currentCompanyKeywords: ['Solace'],
    });
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('keywords=Developer Advocate "Solace"');
    expect(decoded).toContain('currentCompany=["20219"]');
    expect(decoded).toContain('network=["F"]');
  });

  it('emits industryCompany filter when industry IDs supplied', () => {
    const url = buildPeopleUrl({ industryIds: ['4', '6'] });
    expect(decodeURIComponent(url)).toContain('industryCompany=["4","6"]');
  });
});

describe('buildPostsUrl mentions filters', () => {
  it('emits mentionsOrganization filter when company IDs supplied', () => {
    const url = buildPostsUrl({ mentionsCompanyIds: ['1234567'] });
    expect(decodeURIComponent(url)).toContain(
      'mentionsOrganization=["1234567"]'
    );
  });

  it('emits mentionsMember filter when person tokens supplied', () => {
    const url = buildPostsUrl({
      mentionsMemberTokens: ['ACoAAABoeysBTY3vTs8r0yrVtG3s9NapWhiLs7U'],
    });
    expect(decodeURIComponent(url)).toContain(
      'mentionsMember=["ACoAAABoeysBTY3vTs8r0yrVtG3s9NapWhiLs7U"]'
    );
  });
});

describe('buildUrl dispatcher', () => {
  it('dispatches to posts builder', () => {
    expect(
      buildUrl({ type: 'posts', input: { keywords: 'hi' } })
    ).toContain('search/results/content');
  });

  it('dispatches to jobs builder', () => {
    expect(buildUrl({ type: 'jobs', input: {} })).toContain('jobs/search');
  });

  it('dispatches to people builder', () => {
    expect(buildUrl({ type: 'people', input: {} })).toContain(
      'search/results/people'
    );
  });
});

describe('built-in templates', () => {
  it('every template produces a valid URL on a linkedin.com host', () => {
    for (const t of BUILTIN_TEMPLATES) {
      const url = buildUrl(t.search);
      const parsed = new URL(url);
      expect(parsed.hostname).toBe('www.linkedin.com');
    }
  });

  it('every template has a unique id', () => {
    const ids = BUILTIN_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
