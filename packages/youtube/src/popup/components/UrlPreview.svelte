<script lang="ts">
  import { buildUrl, type SearchInput } from '@lib/url-builder';
  import { copyText } from '@toolkit/core';
  import { openUrl } from '../lib/open';

  interface Props {
    search: SearchInput;
    onSave?: () => void;
  }
  let { search, onSave }: Props = $props();

  const url = $derived(buildUrl(search));
  let copyState = $state<'idle' | 'copied' | 'failed'>('idle');

  const handleCopy = async () => {
    const ok = await copyText(url);
    copyState = ok ? 'copied' : 'failed';
    setTimeout(() => (copyState = 'idle'), 1400);
  };
</script>

<div class="card space-y-2">
  <div>
    <div class="label">Generated URL</div>
    <div
      class="break-all rounded border border-slate-200 bg-slate-50 p-1.5 font-mono text-[10.5px] leading-snug text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
    >
      {url}
    </div>
  </div>
  <div class="flex gap-1.5">
    <button class="btn-primary flex-1" type="button" onclick={() => openUrl(url)}>
      Open in YouTube
    </button>
    <button class="btn-secondary" type="button" onclick={handleCopy}>
      {copyState === 'copied'
        ? 'Copied'
        : copyState === 'failed'
          ? 'Copy failed'
          : 'Copy'}
    </button>
    {#if onSave}
      <button class="btn-secondary" type="button" onclick={onSave}>
        Save
      </button>
    {/if}
  </div>
</div>
