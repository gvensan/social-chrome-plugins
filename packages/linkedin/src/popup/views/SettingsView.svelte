<script lang="ts">
  import {
    buildExport,
    getActiveTabUrl,
    restoreImport,
    Select,
    Spinner,
    Tabs,
    type OpenUrlMode,
  } from '@toolkit/core';

  const PLUGIN_ID = 'linkedin';
  const PLUGIN_NAME = 'LinkedIn Feed Toolkit';
  const PLUGIN_VERSION = '0.1.0';
  import type { RecencyPreset, SearchType } from '@lib/url-builder';
  import { savedSearches } from '../stores/saved.svelte';
  import { companies } from '../stores/companies.svelte';
  import { people } from '../stores/people.svelte';
  import {
    settings,
    validateBackup,
    type DisplayMode,
    type Theme,
  } from '../stores/settings.svelte';
  import {
    extractPersonToken,
    extractPersonVanity,
  } from '@lib/company-parser';
  import {
    extractPersonTokenViaFetch,
    extractSelfTokenViaFetch,
  } from '@lib/company-page-extractor';

  const DISPLAY_MODE_OPTIONS: ReadonlyArray<{ id: DisplayMode; label: string }> = [
    { id: 'sidepanel', label: 'Side panel' },
    { id: 'popup', label: 'Popup' },
  ];

  const THEME_OPTIONS: ReadonlyArray<{ id: Theme; label: string }> = [
    { id: 'dark', label: 'Dark' },
    { id: 'light', label: 'Light' },
    { id: 'system', label: 'System' },
  ];

  const OPEN_MODE_OPTIONS: ReadonlyArray<{ id: OpenUrlMode; label: string }> = [
    { id: 'new-tab', label: 'New tab' },
    { id: 'current-tab', label: 'Current tab' },
  ];

  const SEARCH_TYPE_OPTIONS = [
    { value: 'posts', label: 'Posts' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'people', label: 'People' },
  ] as const;

  const LANDING_OPTIONS = [
    { value: 'templates', label: 'Templates' },
    { value: 'builder', label: 'Builder' },
    { value: 'saved', label: 'Saved' },
    { value: 'companies', label: 'Filters' },
  ] as const;

  const RECENCY_OPTIONS = [
    { value: '15min', label: 'Past 15 minutes' },
    { value: '1h', label: 'Past hour' },
    { value: '24h', label: 'Past 24 hours' },
    { value: 'week', label: 'Past week' },
  ] as const;

  let importStatus = $state('');

  // ─── "Your LinkedIn profile" capture ─────────────────────────────
  // Captures the user's vanity (display) and opaque profile token
  // (used to expand Posts → Posted by → "Me" into a fromMember filter
  // at URL build time). Token is the only value LinkedIn's faceted
  // search currently honours for "filter to a specific person."
  let selfInput = $state('');
  let selfStatus = $state('');
  let selfBusy = $state(false);

  const setSelfStatus = (msg: string) => {
    selfStatus = msg;
  };

  const saveSelf = async (vanity: string | undefined, token: string) => {
    await settings.update({ selfVanity: vanity, selfToken: token });
    selfInput = '';
    selfStatus = 'Saved — Posts → "Me" filter is now available.';
    setTimeout(() => (selfStatus = ''), 4000);
  };

  const resolveSelf = async () => {
    if (selfBusy) return;
    selfBusy = true;
    // Set immediately so the user sees activity within ms, not after
    // the first async hop completes.
    selfStatus = 'Resolving …';
    try {
      const raw = selfInput.trim();
      if (!raw) {
        setSelfStatus('Paste your LinkedIn profile URL or vanity first.');
        return;
      }
      const tokenFromInput = extractPersonToken(raw);
      const vanity = extractPersonVanity(raw) ?? raw.replace(/^@/, '');
      if (tokenFromInput) {
        await saveSelf(vanity || undefined, tokenFromInput);
        return;
      }
      if (!vanity) {
        setSelfStatus(
          'Couldn’t parse a vanity. Use linkedin.com/in/<vanity>/ or just <vanity>.'
        );
        return;
      }
      setSelfStatus(`Fetching linkedin.com/in/${vanity}/ …`);
      const res = await extractPersonTokenViaFetch(vanity);
      if (!res.ok) {
        setSelfStatus(`Couldn’t extract profile token: ${res.reason}`);
        return;
      }
      await saveSelf(vanity, res.id);
    } finally {
      selfBusy = false;
    }
  };

  /**
   * Fetch the user's own profile via the signed-in session redirect
   * (`linkedin.com/me/` → `/in/<vanity>/`). Works regardless of which
   * tab the user is on, as long as they're signed in to LinkedIn in
   * this Chrome profile.
   */
  const captureSelfFromTab = async () => {
    if (selfBusy) return;
    selfBusy = true;
    // Visible activity within ms — before the tab-URL await resolves.
    selfStatus = 'Reading active tab …';
    try {
      // Fast path: if the active tab is on the user's own /in/<vanity>/
      // page, we can skip the redirect dance.
      const tabUrl = await getActiveTabUrl();
      if (tabUrl) {
        const tokenFromUrl = extractPersonToken(tabUrl);
        if (tokenFromUrl) {
          const vanity = extractPersonVanity(tabUrl) ?? undefined;
          await saveSelf(vanity, tokenFromUrl);
          return;
        }
      }
      // Session-based fetch: works from any LinkedIn tab (or even no
      // tab at all) — LinkedIn redirects /me/ to the signed-in user's
      // profile, and we extract the token from the resulting HTML.
      setSelfStatus('Fetching linkedin.com/me/ via your session …');
      const res = await extractSelfTokenViaFetch();
      if (!res.ok) {
        setSelfStatus(`Couldn’t auto-detect: ${res.reason}`);
        return;
      }
      await saveSelf(res.vanity, res.token);
    } finally {
      selfBusy = false;
    }
  };

  const clearSelf = async () => {
    await settings.update({ selfVanity: undefined, selfToken: undefined });
    selfStatus = 'Cleared.';
    setTimeout(() => (selfStatus = ''), 2000);
  };

  const exportData = async () => {
    const data = await buildExport({
      pluginId: PLUGIN_ID,
      pluginName: PLUGIN_NAME,
      version: PLUGIN_VERSION,
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin-feed-toolkit-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed: unknown = JSON.parse(text);
        const result = await restoreImport(parsed, PLUGIN_ID, {
          validate: validateBackup,
        });
        if (!result.ok) {
          importStatus = `Import failed: ${result.reason}`;
          setTimeout(() => (importStatus = ''), 6000);
          return;
        }
        await Promise.all([
          savedSearches.load(),
          settings.load(),
          companies.load(),
          people.load(),
        ]);
        importStatus = `Imported ${result.restoredKeys.length} keys (from ${result.meta.pluginName} v${result.meta.version}, exported ${result.meta.exportedAt.slice(0, 10)}).`;
      } catch {
        importStatus = 'Import failed: file is not valid JSON.';
      }
      setTimeout(() => (importStatus = ''), 6000);
    };
    input.click();
  };
</script>

<div class="space-y-3 p-3">
  <div>
    <div class="label">Theme</div>
    <Tabs
      items={THEME_OPTIONS}
      active={settings.value.theme}
      onChange={(id) => settings.update({ theme: id })}
    />
    <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
      "System" follows your OS preference. Default is Light.
    </p>
  </div>

  <div>
    <div class="label">Open as</div>
    <Tabs
      items={DISPLAY_MODE_OPTIONS}
      active={settings.value.displayMode}
      onChange={(id) => settings.update({ displayMode: id })}
    />
    <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
      Side panel stays open while you use LinkedIn. Popup is a quick-glance
      window that closes on outside click.
    </p>
  </div>

  <div>
    <div class="label">Open links in</div>
    <Tabs
      items={OPEN_MODE_OPTIONS}
      active={settings.value.openMode}
      onChange={(id) => settings.update({ openMode: id })}
    />
    <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
      Where Open buttons send the user. "Current tab" navigates the
      active tab in this window; "New tab" creates a fresh tab.
    </p>
  </div>

  <div>
    <div class="label">Default search type</div>
    <Select
      options={SEARCH_TYPE_OPTIONS}
      value={settings.value.defaultSearchType}
      placeholder="Posts"
      onChange={(v) =>
        settings.update({ defaultSearchType: (v ?? 'posts') as SearchType })}
    />
  </div>

  <div>
    <div class="label">Default landing view</div>
    <Select
      options={LANDING_OPTIONS}
      value={settings.value.defaultLandingView}
      placeholder="Templates"
      onChange={(v) =>
        settings.update({
          defaultLandingView: (v ?? 'templates') as
            | 'templates'
            | 'builder'
            | 'saved'
            | 'companies',
        })}
    />
  </div>

  <div>
    <div class="label">Default recency for new job searches</div>
    <Select
      options={RECENCY_OPTIONS}
      value={settings.value.defaultRecency}
      placeholder="Past 24 hours"
      onChange={(v) =>
        settings.update({ defaultRecency: (v ?? '24h') as RecencyPreset })}
    />
  </div>

  <hr class="border-slate-200 dark:border-slate-700" />

  <div class="space-y-2">
    <div class="label">Your LinkedIn profile</div>

    {#if settings.value.selfToken}
      <div
        class="flex items-center justify-between gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900"
      >
        <div class="min-w-0 flex-1">
          <div class="truncate text-[12px] font-medium text-slate-800 dark:text-slate-100">
            {settings.value.selfVanity ?? 'Saved profile'}
          </div>
          <div class="text-[10.5px] text-slate-500 dark:text-slate-400" title={settings.value.selfToken}>
            Token {settings.value.selfToken.slice(0, 12)}…
          </div>
        </div>
        <button
          class="btn-ghost shrink-0 text-[11px]"
          type="button"
          onclick={() => void clearSelf()}
        >
          Clear
        </button>
      </div>
    {:else}
      <input
        class="input"
        placeholder="linkedin.com/in/your-vanity/ or just your-vanity"
        bind:value={selfInput}
        disabled={selfBusy}
      />
      <div class="flex gap-1.5">
        <button
          class="btn-primary flex-1"
          type="button"
          onclick={() => void resolveSelf()}
          disabled={selfBusy || !selfInput.trim()}
        >
          {#if selfBusy}
            <Spinner />
            <span class="ml-1.5">Resolving…</span>
          {:else}
            Resolve
          {/if}
        </button>
        <button
          class="btn-secondary"
          type="button"
          title="Read the URL of the active LinkedIn profile tab and capture your token"
          onclick={() => void captureSelfFromTab()}
          disabled={selfBusy}
        >
          {#if selfBusy}
            <Spinner />
            <span class="ml-1.5">Capturing…</span>
          {:else}
            From current tab
          {/if}
        </button>
      </div>
    {/if}

    {#if selfStatus}
      <p class="text-[11px] text-slate-500 dark:text-slate-400">{selfStatus}</p>
    {/if}
    <p class="text-[10px] leading-snug text-slate-500 dark:text-slate-400">
      Used to expand the Posts → Posted by → "Me" chip into a
      <code>fromMember</code> filter at URL build time. Without it, the
      "Me" option stays hidden (LinkedIn ignores
      <code>postedBy=["me"]</code> when sent via URL).
    </p>
  </div>

  <hr class="border-slate-200 dark:border-slate-700" />

  <div class="space-y-2">
    <div class="label">Backup</div>
    <div class="flex gap-1.5">
      <button class="btn-secondary flex-1" type="button" onclick={exportData}
        >Export JSON</button
      >
      <button class="btn-secondary flex-1" type="button" onclick={importData}
        >Import JSON</button
      >
    </div>
    {#if importStatus}
      <p class="text-[11px] text-slate-500">{importStatus}</p>
    {/if}
  </div>
</div>
