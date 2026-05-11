import { describe, it, expect } from 'vitest';
import {
  cleanSlugForLabel,
  extractCompanyId,
  extractCompanySlug,
  extractPersonId,
  extractPersonToken,
  extractPersonVanity,
} from '../src/lib/company-parser';

describe('extractCompanyId', () => {
  it('accepts a raw numeric ID', () => {
    expect(extractCompanyId('1234567')).toBe('1234567');
  });

  it('trims whitespace', () => {
    expect(extractCompanyId('  9876543  ')).toBe('9876543');
  });

  it('rejects too-short numeric strings', () => {
    expect(extractCompanyId('12')).toBe(null);
  });

  it('rejects non-numeric strings', () => {
    expect(extractCompanyId('not-an-id')).toBe(null);
  });

  it('rejects empty input', () => {
    expect(extractCompanyId('')).toBe(null);
    expect(extractCompanyId('   ')).toBe(null);
  });

  it('extracts from fsd_company URN', () => {
    expect(extractCompanyId('urn:li:fsd_company:1234567')).toBe('1234567');
  });

  it('extracts from plain company URN', () => {
    expect(extractCompanyId('urn:li:company:9999999')).toBe('9999999');
  });

  it('extracts from Sales Navigator URL', () => {
    const url = 'https://www.linkedin.com/sales/company/1234567/people/';
    expect(extractCompanyId(url)).toBe('1234567');
  });

  it('extracts from people-search URL with currentCompany filter', () => {
    const url =
      'https://www.linkedin.com/search/results/people/?currentCompany=%5B%221234567%22%5D';
    expect(extractCompanyId(url)).toBe('1234567');
  });

  it('extracts from people-search URL with pastCompany filter', () => {
    const url =
      'https://www.linkedin.com/search/results/people/?pastCompany=%5B%229876543%22%5D';
    expect(extractCompanyId(url)).toBe('9876543');
  });

  it('extracts from jobs-search URL with f_C parameter', () => {
    const url =
      'https://www.linkedin.com/jobs/search/?f_C=1234567&keywords=engineer';
    expect(extractCompanyId(url)).toBe('1234567');
  });

  it('returns null for the plain /company/<slug>/ URL (no ID present)', () => {
    expect(
      extractCompanyId('https://www.linkedin.com/company/solace/')
    ).toBe(null);
  });

  it('returns null for a LinkedIn URL with no company filter', () => {
    expect(
      extractCompanyId('https://www.linkedin.com/feed/')
    ).toBe(null);
  });
});

describe('extractCompanySlug', () => {
  it('extracts slug from /company/<slug>/', () => {
    expect(
      extractCompanySlug('https://www.linkedin.com/company/solacedotcom/')
    ).toBe('solacedotcom');
  });

  it('extracts slug from /company/<slug>/posts/?...', () => {
    expect(
      extractCompanySlug(
        'https://www.linkedin.com/company/solacedotcom/posts/?feed=...'
      )
    ).toBe('solacedotcom');
  });

  it('extracts slug from /company/<slug>/people/', () => {
    expect(
      extractCompanySlug('https://www.linkedin.com/company/solace/people/')
    ).toBe('solace');
  });

  it('returns null for non-LinkedIn URLs', () => {
    expect(extractCompanySlug('https://example.com/company/foo/')).toBe(null);
  });

  it('returns null for LinkedIn URLs without /company/', () => {
    expect(extractCompanySlug('https://www.linkedin.com/feed/')).toBe(null);
  });

  it('returns null for non-URL input', () => {
    expect(extractCompanySlug('1234567')).toBe(null);
    expect(extractCompanySlug('not-a-url')).toBe(null);
  });
});

describe('cleanSlugForLabel', () => {
  it('strips trailing dotcom suffix and titleizes', () => {
    expect(cleanSlugForLabel('solacedotcom')).toBe('Solace');
  });

  it('replaces hyphens with spaces and titleizes', () => {
    expect(cleanSlugForLabel('acme-corp')).toBe('Acme Corp');
  });

  it('titleizes a plain slug', () => {
    expect(cleanSlugForLabel('microsoft')).toBe('Microsoft');
  });

  it('handles multiple hyphens', () => {
    expect(cleanSlugForLabel('foo-bar-baz')).toBe('Foo Bar Baz');
  });

  it('does not strip dotcom if it would leave nothing', () => {
    expect(cleanSlugForLabel('dotcom')).toBe('Dotcom');
  });

  it('strips dotcom even when slug also has hyphens', () => {
    expect(cleanSlugForLabel('foo-dotcom')).toBe('Foo');
  });
});

describe('extractPersonVanity', () => {
  it('extracts vanity from /in/<vanity>/', () => {
    expect(
      extractPersonVanity('https://www.linkedin.com/in/billgates/')
    ).toBe('billgates');
  });

  it('extracts vanity from deeper paths', () => {
    expect(
      extractPersonVanity('https://www.linkedin.com/in/giri-v/recent-activity/')
    ).toBe('giri-v');
  });

  it('returns null for non-LinkedIn URLs', () => {
    expect(extractPersonVanity('https://example.com/in/foo/')).toBe(null);
  });

  it('returns null for LinkedIn URLs without /in/', () => {
    expect(extractPersonVanity('https://www.linkedin.com/company/foo/')).toBe(
      null
    );
  });
});

describe('extractPersonId', () => {
  it('accepts a raw numeric ID', () => {
    expect(extractPersonId('12345678')).toBe('12345678');
  });

  it('extracts from fsd_member URN', () => {
    expect(extractPersonId('urn:li:fsd_member:12345678')).toBe('12345678');
  });

  it('extracts from plain member URN', () => {
    expect(extractPersonId('urn:li:member:9876543')).toBe('9876543');
  });

  it('extracts from Sales Navigator lead URL', () => {
    expect(
      extractPersonId('https://www.linkedin.com/sales/lead/1234567/...')
    ).toBe('1234567');
  });

  it('returns null for /in/<vanity>/ URLs (vanity is not an ID)', () => {
    expect(extractPersonId('https://www.linkedin.com/in/billgates/')).toBe(
      null
    );
  });

  it('returns null for non-numeric / non-URN inputs', () => {
    expect(extractPersonId('billgates')).toBe(null);
    expect(extractPersonId('')).toBe(null);
  });
});

describe('extractPersonToken', () => {
  const TOKEN = 'ACoAAABoeysBTY3vTs8r0yrVtG3s9NapWhiLs7U';

  it('accepts a raw profile token', () => {
    expect(extractPersonToken(TOKEN)).toBe(TOKEN);
  });

  it('extracts from a profile URN', () => {
    expect(extractPersonToken(`urn:li:fsd_profile:${TOKEN}`)).toBe(TOKEN);
  });

  it('extracts from an opaque /in/<token>/ profile URL', () => {
    expect(
      extractPersonToken(`https://www.linkedin.com/in/${TOKEN}/`)
    ).toBe(TOKEN);
  });

  it('extracts from a search URL with fromMember filter', () => {
    expect(
      extractPersonToken(
        `https://www.linkedin.com/search/results/content/?fromMember=%5B%22${TOKEN}%22%5D`
      )
    ).toBe(TOKEN);
  });

  it('returns null for vanity, numeric ID, or unrelated text', () => {
    expect(extractPersonToken('billgates')).toBe(null);
    expect(extractPersonToken('12345678')).toBe(null);
    expect(
      extractPersonToken('https://www.linkedin.com/in/billgates/')
    ).toBe(null);
  });
});

describe('extractPersonVanity treats /in/ACoAA…/ as a token, not a vanity', () => {
  const TOKEN = 'ACoAAABoeysBTY3vTs8r0yrVtG3s9NapWhiLs7U';
  it('returns null for opaque-token profile URLs', () => {
    expect(
      extractPersonVanity(`https://www.linkedin.com/in/${TOKEN}/`)
    ).toBe(null);
  });
});
