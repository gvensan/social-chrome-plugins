<script lang="ts">
  import { INDUSTRY_OPTIONS } from '@lib/params';

  interface Props {
    /** Currently-selected industry ID, or undefined for none. */
    value: string | undefined;
    onChange: (id: string | undefined) => void;
    placeholder?: string;
  }

  let {
    value,
    onChange,
    placeholder = 'Any industry',
  }: Props = $props();

  let open = $state(false);
  let query = $state('');

  const selected = $derived(
    value ? INDUSTRY_OPTIONS.find((o) => o.value === value) : undefined
  );

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INDUSTRY_OPTIONS;
    return INDUSTRY_OPTIONS.filter((o) => o.label.toLowerCase().includes(q));
  });

  const pick = (id: string) => {
    onChange(id);
    open = false;
    query = '';
  };

  const clear = () => {
    onChange(undefined);
    open = false;
    query = '';
  };

  const toggle = () => {
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
      onclick={toggle}
      aria-expanded={open}
    >
      <span class="truncate">
        {#if selected}
          <span class="font-medium">{selected.label}</span>
        {:else}
          <span class="text-slate-400">{placeholder}</span>
        {/if}
      </span>
      <span class="text-[10px] text-slate-400">{open ? '▴' : '▾'}</span>
    </button>
    {#if selected}
      <button
        type="button"
        class="btn-secondary !px-2 text-[12px]"
        title="Clear selection"
        aria-label="Clear selection"
        onclick={clear}
      >
        ×
      </button>
    {/if}
  </div>

  {#if open}
    <div
      class="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="border-b border-slate-200 p-1.5 dark:border-slate-700">
        <input
          class="input !py-1 !text-[12px]"
          placeholder="Search industries…"
          bind:value={query}
          use:focusOnMount
        />
      </div>
      <div class="max-h-52 overflow-y-auto">
        {#if filtered.length === 0}
          <div class="p-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
            No matches.
          </div>
        {:else}
          <ul>
            {#each filtered as o (o.value)}
              <li>
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-[12px] hover:bg-slate-100 dark:hover:bg-slate-700"
                  class:bg-brand-50={value === o.value}
                  onclick={() => pick(o.value)}
                >
                  <span class="min-w-0 flex-1 truncate font-medium">
                    {o.label}
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
