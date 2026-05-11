<script lang="ts">
  import type { Template } from '@lib/templates';
  import { buildUrl } from '@lib/url-builder';
  import { summarizeSearch } from '@lib/template-preview';
  import { router } from '@toolkit/core';
  import { openUrl } from '../lib/open';
  import { builder } from '../stores/builder.svelte';

  interface Props {
    template: Template;
  }
  let { template }: Props = $props();

  const url = $derived(buildUrl(template.search));
  const preview = $derived(summarizeSearch(template.search));
  const needsSetup = $derived(template.requiresCustomize === true);

  // One-line guidance specific to the focus axis. Generic fallback
  // covers templates that need setup but don't specify a focus.
  const setupHint = $derived(
    template.focus === 'company'
      ? 'Pick a saved company before opening, or you\'ll see a generic feed.'
      : template.focus === 'person'
        ? 'Pick a saved person before opening, or you\'ll see a generic feed.'
        : 'Customize first — direct Open returns an unfiltered feed.'
  );

  const customize = () => {
    builder.loadSearch(template.search, {
      title: template.title,
      focus: template.focus,
    });
    router.go('builder');
  };
</script>

<div class="card space-y-1.5">
  <div class="flex items-start justify-between gap-2">
    <div>
      <div class="text-[12.5px] font-semibold">{template.title}</div>
      <p class="text-[11px] text-slate-500 dark:text-slate-400">
        {template.description}
      </p>
    </div>
    <div class="flex shrink-0 flex-col items-end gap-1">
      {#if needsSetup}
        <span
          class="rounded-full bg-sky-100 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-sky-800 dark:bg-sky-900 dark:text-sky-200"
          title="Direct Open returns an unfiltered feed — Customize first"
          >Setup needed</span
        >
      {/if}
      {#if template.experimental}
        <span
          class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          >Beta</span
        >
      {/if}
    </div>
  </div>
  {#if preview}
    <div
      class="rounded bg-slate-100 px-1.5 py-1 font-mono text-[10px] leading-snug text-slate-600 dark:bg-slate-900/40 dark:text-slate-300"
      title="What Open will set in the URL"
    >
      {preview}
    </div>
  {/if}
  {#if needsSetup}
    <p
      class="rounded border border-sky-200 bg-sky-50 px-1.5 py-1 text-[10.5px] leading-snug text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200"
    >
      {setupHint}
    </p>
  {/if}
  <div class="flex gap-1.5">
    <button class="btn-primary flex-1" type="button" onclick={() => openUrl(url)}>
      {needsSetup ? 'Open as-is' : 'Open'}
    </button>
    <button class="btn-secondary flex-1" type="button" onclick={customize}>
      Customize
    </button>
  </div>
</div>
