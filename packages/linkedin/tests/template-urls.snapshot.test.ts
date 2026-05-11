// Diagnostic test: prints every built-in template's actual generated
// URL plus its Beta / Setup-needed status. Useful when investigating
// "this template isn't producing results" reports — the URLs are
// emitted via console.log so they appear in test output and can be
// pasted into a browser for verification.

import { describe, it } from 'vitest';
import { buildUrl } from '../src/lib/url-builder';
import { BUILTIN_TEMPLATES } from '../src/lib/templates';

describe('template URL audit', () => {
  it('prints every template id, status flags, and generated URL', () => {
    /* eslint-disable no-console */
    console.log('\n=== LinkedIn template URL audit ===\n');
    for (const t of BUILTIN_TEMPLATES) {
      const url = buildUrl(t.search);
      const flags: string[] = [];
      if (t.experimental) flags.push('BETA');
      if (t.requiresCustomize) flags.push('NEEDS-CUSTOMIZE');
      const flagStr = flags.length ? ` [${flags.join(' · ')}]` : '';
      console.log(`• ${t.id}${flagStr}`);
      console.log(`  ${url}\n`);
    }
    /* eslint-enable no-console */
  });
});
