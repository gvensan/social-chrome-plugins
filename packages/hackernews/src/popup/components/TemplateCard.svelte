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

  const customize = () => {
    builder.loadSearch(template.search);
    router.go('builder');
  };

  const isSpecial = $derived(template.search.type === 'special');
</script>

<div class="card space-y-1.5">
  <div class="flex items-start justify-between gap-2">
    <div>
      <div class="text-[12.5px] font-semibold">{template.title}</div>
      <p class="text-[11px] text-slate-500 dark:text-slate-400">
        {template.description}
      </p>
    </div>
    {#if template.experimental}
      <span
        class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-amber-800 dark:bg-amber-900 dark:text-amber-200"
        >Beta</span
      >
    {/if}
  </div>
  {#if preview}
    <div
      class="rounded bg-slate-100 px-1.5 py-1 font-mono text-[10px] leading-snug text-slate-600 dark:bg-slate-900/40 dark:text-slate-300"
      title="What Open will set in the URL"
    >
      {preview}
    </div>
  {/if}
  <div class="flex gap-1.5">
    <button class="btn-primary flex-1" type="button" onclick={() => openUrl(url)}
      >Open</button
    >
    {#if !isSpecial}
      <button class="btn-secondary" type="button" onclick={customize}
        >Customize</button
      >
    {/if}
  </div>
</div>
