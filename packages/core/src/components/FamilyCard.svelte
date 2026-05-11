<script lang="ts">
  import type { SiblingPlugin } from '../family';
  import { openUrl } from '../browser';

  interface Props {
    plugin: SiblingPlugin;
  }
  let { plugin }: Props = $props();

  const open = () => {
    if (plugin.webStoreUrl) openUrl(plugin.webStoreUrl);
  };

  const initial = $derived(plugin.name.charAt(0));
</script>

<div
  class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
>
  <div
    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-600 text-[13px] font-bold text-white"
  >
    {initial}
  </div>
  <div class="min-w-0 flex-1">
    <div class="flex items-center gap-1.5">
      <div class="truncate text-[12.5px] font-semibold">{plugin.name}</div>
      {#if plugin.status === 'coming-soon'}
        <span
          class="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          >Soon</span
        >
      {/if}
    </div>
    <p class="text-[10.5px] text-slate-500 dark:text-slate-400">
      {plugin.description}
    </p>
  </div>
  <button
    class="btn-secondary !text-[11px]"
    type="button"
    onclick={open}
    disabled={plugin.status !== 'available' || !plugin.webStoreUrl}
  >
    {plugin.status === 'available' && plugin.webStoreUrl ? 'Open' : 'Soon'}
  </button>
</div>
