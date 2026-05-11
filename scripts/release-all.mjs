// Build + zip every shipping plugin into release/.
// Sequential rather than parallel so the per-plugin Vite output stays
// readable and one failure doesn't drown out others. The whole loop
// short-circuits on the first failure (exit 1).
//
// Usage:
//   node scripts/release-all.mjs           # build + zip all 7
//   node scripts/release-all.mjs --publish # also upload each to CWS
//                                          # (requires CWS_* env vars
//                                          # and EXTENSION_ID_<PKG> for
//                                          # every plugin)

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const PACKAGES = [
  'linkedin',
  'github',
  'x',
  'youtube',
  'reddit',
  'huggingface',
  'hackernews',
];

const publish = process.argv.includes('--publish');
const scriptPath = resolve('scripts/release.mjs');

const summary = [];
for (const pkg of PACKAGES) {
  console.log(`\n========================================`);
  console.log(`  ${pkg}${publish ? ' (publish)' : ''}`);
  console.log(`========================================\n`);
  const args = [scriptPath, pkg];
  if (publish) args.push('--publish');
  const result = spawnSync('node', args, { stdio: 'inherit' });
  if (result.status !== 0) {
    summary.push({ pkg, ok: false, code: result.status ?? -1 });
    console.error(
      `\n[release-all] ${pkg} failed with exit code ${result.status}. ` +
        `Aborting — earlier plugins succeeded; the remaining were skipped.`
    );
    printSummary(summary);
    process.exit(1);
  }
  summary.push({ pkg, ok: true });
}

printSummary(summary);

function printSummary(rows) {
  console.log('\n========================================');
  console.log('  release-all summary');
  console.log('========================================');
  for (const row of rows) {
    console.log(`  ${row.ok ? '✓' : '✗'}  ${row.pkg}`);
  }
}
