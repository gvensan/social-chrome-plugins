<script lang="ts">
  import {
    buildExport,
    restoreImport,
    Select,
    Tabs,
    type OpenUrlMode,
  } from '@toolkit/core';

  const PLUGIN_ID = 'x';
  const PLUGIN_NAME = 'X Search Toolkit';
  const PLUGIN_VERSION = '0.1.0';
  import type { XSearchMode } from '@lib/url-builder';
  import { savedSearches } from '../stores/saved.svelte';
  import {
    settings,
    validateBackup,
    type DisplayMode,
    type Theme,
  } from '../stores/settings.svelte';

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

  const SEARCH_MODE_OPTIONS = [
    { value: 'top', label: 'Top' },
    { value: 'latest', label: 'Latest' },
    { value: 'people', label: 'People' },
    { value: 'media', label: 'Media' },
  ] as const;

  const LANDING_OPTIONS = [
    { value: 'templates', label: 'Templates' },
    { value: 'builder', label: 'Builder' },
    { value: 'saved', label: 'Saved' },
  ] as const;

  let importStatus = $state('');

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
    a.download = `x-search-toolkit-${new Date()
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
        await Promise.all([savedSearches.load(), settings.load()]);
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
      Side panel stays open while you use X. Popup is a quick-glance window
      that closes on outside click.
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
    <div class="label">Default search mode</div>
    <Select
      options={SEARCH_MODE_OPTIONS}
      value={settings.value.defaultSearchMode}
      placeholder="Top"
      onChange={(v) =>
        settings.update({ defaultSearchMode: (v ?? 'top') as XSearchMode })}
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
            | 'saved',
        })}
    />
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
