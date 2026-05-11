<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from '@toolkit/core';
  import { savedSearches } from './stores/saved.svelte';
  import { settings, type Theme } from './stores/settings.svelte';
  import { builder } from './stores/builder.svelte';
  import { companies } from './stores/companies.svelte';
  import { people } from './stores/people.svelte';
  import TemplatesView from './views/TemplatesView.svelte';
  import BuilderView from './views/BuilderView.svelte';
  import SavedView from './views/SavedView.svelte';
  import CompaniesView from './views/CompaniesView.svelte';
  import SettingsView from './views/SettingsView.svelte';
  import AboutView from './views/AboutView.svelte';
  import NavBar from './components/NavBar.svelte';

  const isSystemDark = (): boolean =>
    globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

  const applyTheme = (theme: Theme): void => {
    const dark = theme === 'dark' || (theme === 'system' && isSystemDark());
    document.documentElement.classList.toggle('dark', dark);
  };

  onMount(async () => {
    await Promise.all([
      savedSearches.load(),
      settings.load(),
      companies.load(),
      people.load(),
    ]);
    builder.setType(settings.value.defaultSearchType);
    if (settings.value.defaultLandingView !== 'templates') {
      router.go(settings.value.defaultLandingView);
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', () => {
        if (settings.value.theme === 'system') applyTheme('system');
      });
    }
  });

  $effect(() => {
    if (settings.loaded) applyTheme(settings.value.theme);
  });
</script>

<div class="flex h-full w-full flex-col">
  <header
    class="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-700"
  >
    <button
      type="button"
      class="flex items-center gap-1.5 text-left text-slate-700 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-300"
      title="Home"
      aria-label="Go to Home"
      onclick={() => router.go('templates')}
    >
      <svg
        class="h-3.5 w-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 12L12 3l9 9M5 10v10h5v-6h4v6h5V10"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <h1 class="text-[13px] font-semibold tracking-tight">
        LinkedIn Feed Toolkit
      </h1>
    </button>
    <span class="text-[10px] text-slate-400">v0.1</span>
  </header>
  <main class="flex-1 overflow-y-auto">
    {#if router.view === 'templates'}
      <TemplatesView />
    {:else if router.view === 'builder'}
      <BuilderView />
    {:else if router.view === 'saved'}
      <SavedView />
    {:else if router.view === 'companies'}
      <CompaniesView />
    {:else if router.view === 'settings'}
      <SettingsView />
    {:else if router.view === 'about'}
      <AboutView />
    {/if}
  </main>
  <NavBar />
</div>
