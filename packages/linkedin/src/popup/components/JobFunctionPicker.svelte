<script lang="ts">
  import { JOB_FUNCTION_OPTIONS } from '@lib/params';

  interface Props {
    value: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
  }

  let {
    value,
    onChange,
    placeholder = 'Any function',
  }: Props = $props();

  let open = $state(false);
  let query = $state('');

  const selectedLabels = $derived.by(() => {
    if (!value.length) return null;
    const set = new Set(value);
    return JOB_FUNCTION_OPTIONS.filter((o) => set.has(o.value)).map(
      (o) => o.label
    );
  });

  const summary = $derived.by(() => {
    if (!selectedLabels) return null;
    if (selectedLabels.length === 1) return selectedLabels[0];
    return `${selectedLabels.length} selected`;
  });

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return JOB_FUNCTION_OPTIONS;
    return JOB_FUNCTION_OPTIONS.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q)
    );
  });

  const toggle = (id: string) => {
    const next = value.includes(id)
      ? value.filter((x) => x !== id)
      : [...value, id];
    onChange(next);
  };

  const clearAll = () => {
    onChange([]);
    open = false;
    query = '';
  };

  const toggleOpen = () => {
    open = !open;
    if (open) query = '';
  };

  const closeOnOutside = (node: HTMLElement) => {
    const handler = (e: MouseEvent) => {
      if (!node.contains(e.target as Node)) open = false;
    };
    document.addEventListener('click', handler);
    return {
      destroy: () => document.removeEventListener('click', handler),
    };
  };

  const focusOnMount = (node: HTMLInputElement) => {
    node.focus();
  };
</script>

<div class="relative" use:closeOnOutside>
  <div class="flex w-full items-stretch gap-1">
    <button
      type="button"
      class="input flex flex-1 items-center justify-between gap-1 text-left"
      onclick={toggleOpen}
      aria-expanded={open}
    >
      <span class="truncate">
        {#if summary}
          <span class="font-medium">{summary}</span>
        {:else}
          <span class="text-slate-400">{placeholder}</span>
        {/if}
      </span>
      <span class="text-[10px] text-slate-400">{open ? '▴' : '▾'}</span>
    </button>
    {#if value.length > 0}
      <button
        type="button"
        class="btn-secondary !px-2 text-[12px]"
        title="Clear all"
        aria-label="Clear all functions"
        onclick={clearAll}
      >
        ×
      </button>
    {/if}
  </div>

  {#if open}
    <div
      class="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="border-b border-slate-200 p-1.5 dark:border-slate-700">
        <input
          class="input !py-1 !text-[12px]"
          placeholder="Search functions…"
          bind:value={query}
          use:focusOnMount
        />
      </div>
      <div class="max-h-60 overflow-y-auto">
        {#if filtered.length === 0}
          <div class="p-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
            No matches.
          </div>
        {:else}
          <ul>
            {#each filtered as o (o.value)}
              {@const checked = value.includes(o.value)}
              <li>
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-[12px] hover:bg-slate-100 dark:hover:bg-slate-700"
                  class:bg-brand-50={checked}
                  onclick={() => toggle(o.value)}
                >
                  <span class="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-slate-300 dark:border-slate-600"
                      class:bg-brand-600={checked}
                      class:border-brand-600={checked}
                    >
                      {#if checked}
                        <span class="text-[9px] leading-none text-white">✓</span>
                      {/if}
                    </span>
                    <span class="truncate font-medium">{o.label}</span>
                  </span>
                  <span class="text-[10px] text-slate-400">{o.value}</span>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  {/if}
</div>
