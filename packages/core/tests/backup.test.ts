import { beforeEach, describe, expect, it } from 'vitest';
import { buildExport, restoreImport } from '../src/backup';
import {
  __resetMemoryStoreForTests,
  dumpAll,
  loadKey,
  saveKey,
} from '../src/storage';

const PLUGIN = {
  pluginId: 'reddit',
  pluginName: 'Reddit Search Toolkit',
  version: '0.1.0',
};

beforeEach(() => {
  __resetMemoryStoreForTests();
});

describe('buildExport', () => {
  it('wraps current storage with metadata', async () => {
    await saveKey('settings', { theme: 'dark' });
    await saveKey('savedSearches', [
      { id: 'a', name: 'one', tags: [], search: {}, url: '', createdAt: 1 },
    ]);

    const file = await buildExport(PLUGIN);

    expect(file['__toolkit']).toMatchObject({
      plugin: 'reddit',
      pluginName: 'Reddit Search Toolkit',
      version: '0.1.0',
      schema: 1,
    });
    expect(file['settings']).toEqual({ theme: 'dark' });
    expect(Array.isArray(file['savedSearches'])).toBe(true);
  });
});

describe('restoreImport — metadata gate', () => {
  it('rejects non-object input', async () => {
    expect(await restoreImport(null, 'reddit')).toMatchObject({ ok: false });
    expect(await restoreImport('foo', 'reddit')).toMatchObject({ ok: false });
    expect(await restoreImport([], 'reddit')).toMatchObject({ ok: false });
  });

  it('rejects files without the toolkit metadata header', async () => {
    const r = await restoreImport({ settings: {} }, 'reddit');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/metadata header/i);
  });

  it('rejects cross-plugin imports', async () => {
    const file = {
      __toolkit: {
        plugin: 'github',
        pluginName: 'GitHub',
        version: '0.1.0',
        schema: 1,
        exportedAt: '2026-01-01T00:00:00Z',
      },
      settings: {},
    };
    const r = await restoreImport(file, 'reddit');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/from the "github" plugin/);
  });

  it('rejects newer schema', async () => {
    const file = {
      __toolkit: {
        plugin: 'reddit',
        pluginName: 'Reddit',
        version: '0.1.0',
        schema: 99,
        exportedAt: '2026-01-01T00:00:00Z',
      },
      settings: {},
    };
    const r = await restoreImport(file, 'reddit');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/newer backup schema/);
  });
});

describe('restoreImport — replacement semantics (the Codex bug)', () => {
  // The bug: pre-fix, restoreImport called area.set(payload), which is
  // a merge. So importing an "older" backup left newer keys in place,
  // making rollback impossible.

  it('removes keys present locally but absent from the backup', async () => {
    // Local state: 3 keys.
    await saveKey('settings', { theme: 'light' });
    await saveKey('savedSearches', []);
    await saveKey('newFeatureState', { added: 'after-export' });

    // Backup only carries 2 of them (older snapshot).
    const file = {
      __toolkit: {
        plugin: 'reddit',
        pluginName: 'Reddit',
        version: '0.1.0',
        schema: 1,
        exportedAt: '2026-01-01T00:00:00Z',
      },
      settings: { theme: 'dark' },
      savedSearches: [],
    };

    const r = await restoreImport(file, 'reddit');
    expect(r.ok).toBe(true);

    // The restored state must NOT include `newFeatureState`.
    const after = await dumpAll();
    expect(after).not.toHaveProperty('newFeatureState');
    expect(after['settings']).toEqual({ theme: 'dark' });
    expect(after['savedSearches']).toEqual([]);
  });

  it('round-trips: export → mutate → import → state matches export', async () => {
    await saveKey('settings', { theme: 'dark', count: 5 });
    await saveKey('savedSearches', [
      { id: 'x', name: 'hello', tags: [], search: {}, url: '', createdAt: 1 },
    ]);

    const file = await buildExport(PLUGIN);

    // Mutate local state heavily after the export.
    await saveKey('settings', { theme: 'light', count: 99 });
    await saveKey('savedSearches', []);
    await saveKey('extraKey', 'leftover');

    const r = await restoreImport(file, 'reddit');
    expect(r.ok).toBe(true);

    const after = await dumpAll();
    expect(after).not.toHaveProperty('extraKey');
    expect(after['settings']).toEqual({ theme: 'dark', count: 5 });
    expect(Array.isArray(after['savedSearches'])).toBe(true);
    expect((after['savedSearches'] as unknown[]).length).toBe(1);
  });

  it('does not write any keys when validation fails (fail-closed)', async () => {
    await saveKey('settings', { theme: 'light' });
    const before = await dumpAll();

    const file = {
      __toolkit: {
        plugin: 'reddit',
        pluginName: 'Reddit',
        version: '0.1.0',
        schema: 1,
        exportedAt: '2026-01-01T00:00:00Z',
      },
      settings: 'not-an-object', // malformed
    };

    const r = await restoreImport(file, 'reddit');
    expect(r.ok).toBe(false);

    // Local state must be untouched — no clear, no partial write.
    const after = await dumpAll();
    expect(after).toEqual(before);
  });
});

describe('restoreImport — built-in shape validators', () => {
  const wrap = (payload: Record<string, unknown>) => ({
    __toolkit: {
      plugin: 'reddit',
      pluginName: 'Reddit',
      version: '0.1.0',
      schema: 1,
      exportedAt: '2026-01-01T00:00:00Z',
    },
    ...payload,
  });

  it('accepts payloads where settings is a plain object', async () => {
    const r = await restoreImport(wrap({ settings: { theme: 'dark' } }), 'reddit');
    expect(r.ok).toBe(true);
  });

  it('rejects settings that is not a plain object', async () => {
    for (const bad of [42, 'hi', null, [], true]) {
      const r = await restoreImport(
        wrap({ settings: bad as unknown }),
        'reddit'
      );
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toMatch(/`settings` must be an object/);
    }
  });

  it('rejects savedSearches that is not an array', async () => {
    const r = await restoreImport(
      wrap({ savedSearches: { not: 'array' } }),
      'reddit'
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/`savedSearches` must be an array/);
  });

  it('rejects savedSearches items missing id or name', async () => {
    const r = await restoreImport(
      wrap({
        savedSearches: [
          { id: 'good', name: 'ok' },
          { id: 'no-name' /* missing name */ },
        ],
      }),
      'reddit'
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/savedSearches\[1\]/);
  });

  it('accepts well-formed savedSearches', async () => {
    const r = await restoreImport(
      wrap({
        savedSearches: [
          { id: 'a', name: 'one' },
          { id: 'b', name: 'two', extra: 'ignored' },
        ],
      }),
      'reddit'
    );
    expect(r.ok).toBe(true);
  });

  it('passes through unknown keys without validation', async () => {
    // Plugin-specific keys aren't gated by built-in validators; they
    // either pass via plugin-supplied validate() or write through.
    const r = await restoreImport(
      wrap({ savedCompanies: [{ id: 1, label: 'whatever' }] }),
      'reddit'
    );
    expect(r.ok).toBe(true);
  });
});

describe('restoreImport — plugin-supplied validator', () => {
  const wrap = (payload: Record<string, unknown>) => ({
    __toolkit: {
      plugin: 'reddit',
      pluginName: 'Reddit',
      version: '0.1.0',
      schema: 1,
      exportedAt: '2026-01-01T00:00:00Z',
    },
    ...payload,
  });

  it('runs after built-in gate; can reject plugin-specific payloads', async () => {
    const r = await restoreImport(
      wrap({ savedCompanies: 'oops-not-array' }),
      'reddit',
      {
        validate: (payload) => {
          if (
            'savedCompanies' in payload &&
            !Array.isArray(payload['savedCompanies'])
          ) {
            return { ok: false, reason: 'savedCompanies must be an array' };
          }
          return { ok: true };
        },
      }
    );
    expect(r.ok).toBe(false);
    if (!r.ok)
      expect(r.reason).toMatch(/savedCompanies must be an array/);
  });

  it('does not write when plugin validator rejects', async () => {
    await saveKey('settings', { theme: 'light' });
    const before = await dumpAll();

    const r = await restoreImport(wrap({}), 'reddit', {
      validate: () => ({ ok: false, reason: 'no' }),
    });
    expect(r.ok).toBe(false);

    expect(await dumpAll()).toEqual(before);
  });

  it('proceeds when validator returns ok', async () => {
    const r = await restoreImport(wrap({ settings: { ok: true } }), 'reddit', {
      validate: () => ({ ok: true }),
    });
    expect(r.ok).toBe(true);
    expect(await loadKey('settings', null)).toEqual({ ok: true });
  });
});
