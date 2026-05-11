// Build, zip, and (optionally) publish a single extension package to the
// Chrome Web Store.
//
// Usage:
//   node scripts/release.mjs <package> [--publish]
//
// Examples:
//   node scripts/release.mjs linkedin            # build + zip → release/
//   node scripts/release.mjs linkedin --publish  # also upload via chrome-webstore-upload-cli
//
// The --publish flag expects these env vars to be set (e.g. via GitHub Actions
// secrets): EXTENSION_ID_<PKG>, CWS_CLIENT_ID, CWS_CLIENT_SECRET,
// CWS_REFRESH_TOKEN. See README §Releasing.

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = process.argv[2];
const publish = process.argv.includes('--publish');

if (!pkg) {
  console.error('error: package name required, e.g. `node scripts/release.mjs linkedin`');
  process.exit(1);
}

const pkgDir = resolve('packages', pkg);
if (!existsSync(pkgDir)) {
  console.error(`error: packages/${pkg} not found`);
  process.exit(1);
}

const manifestPath = resolve(pkgDir, 'src/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const version = manifest.version;

const releaseDir = resolve('release');
mkdirSync(releaseDir, { recursive: true });
const zipName = `${pkg}-v${version}.zip`;
const zipPath = resolve(releaseDir, zipName);

const run = (cmd, opts = {}) => {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
};

console.log(`\n>>> Building @toolkit/${pkg}-extension v${version}\n`);
run(`npm run build -w @toolkit/${pkg}-extension`);

console.log(`\n>>> Zipping dist/ → ${zipName}\n`);
// Delete the previous zip first — `zip -r` UPDATES an existing
// archive in place rather than overwriting it, which would leave
// behind files that were renamed or removed between releases
// (e.g. the stale `public/icons/` path before we fixed the manifest
// to reference `icons/` directly).
rmSync(zipPath, { force: true });
// Keep `.map` files in the zip — Chrome Web Store review treats
// sourcemaps as a sign of code transparency and uses them to trace
// bundled JS back to source without asking for a private repo.
// See documents/PUBLISHING.md §3.2 (Common rejection reasons).
run(`cd packages/${pkg}/dist && zip -r ${zipPath} .`);

console.log(`\n>>> Done. Artifact: ${zipPath}`);

if (!publish) {
  console.log(
    '\nTip: pass --publish to upload via chrome-webstore-upload-cli (requires CWS_* env vars and EXTENSION_ID_' +
      pkg.toUpperCase() +
      ').'
  );
  process.exit(0);
}

const extensionIdEnv = `EXTENSION_ID_${pkg.toUpperCase()}`;
const extensionId = process.env[extensionIdEnv];
if (!extensionId) {
  console.error(`error: env var ${extensionIdEnv} not set; cannot publish.`);
  process.exit(1);
}

console.log(`\n>>> Uploading to Chrome Web Store (extension ${extensionId})\n`);
run(
  `npx chrome-webstore-upload-cli@3 upload --source ${zipPath} --extension-id ${extensionId} --auto-publish`
);

console.log('\n>>> Submitted to Chrome Web Store. Review queue typically takes hours to days.');
