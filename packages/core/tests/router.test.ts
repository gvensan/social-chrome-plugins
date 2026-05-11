import { describe, expect, it } from 'vitest';
import type { View } from '../src/stores/router.svelte';

// The `View` type is now `string` (was a closed union with the
// LinkedIn-specific 'companies' bleeding into core). These tests are
// type-level — they pin the behavior so we don't accidentally
// re-narrow View and re-couple core to plugin-specific view names.
//
// We can't import the router store itself in a non-Svelte test file
// because it relies on the $state rune; the type-only check is what
// matters here for the design contract.

describe('View type', () => {
  it('accepts arbitrary plugin-defined view names', () => {
    // If View were re-narrowed to a closed union, these would fail
    // type-check at the assignment.
    const a: View = 'templates';
    const b: View = 'builder';
    const c: View = 'saved';
    const d: View = 'settings';
    const e: View = 'about';
    // Plugin-specific:
    const f: View = 'companies';
    const g: View = 'stats';
    const h: View = 'whatever-future-plugin-needs';

    expect([a, b, c, d, e, f, g, h]).toHaveLength(8);
  });

  it('plugins can locally narrow View for typo safety', () => {
    type LocalView = 'templates' | 'builder' | 'saved';
    const v: LocalView = 'templates';
    // LocalView is assignable to View (string), confirming plugins
    // can pass their narrowed type through to router.go.
    const w: View = v;
    expect(w).toBe('templates');
  });
});
