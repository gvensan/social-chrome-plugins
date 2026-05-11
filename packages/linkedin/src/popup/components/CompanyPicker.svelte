<script lang="ts">
  import { companies, companyKey } from '../stores/companies.svelte';
  import type { Company } from '../stores/companies.svelte';
  import { router } from '@toolkit/core';

  interface Props {
    /** Identity key (`id:<id>` or `slug:<slug>`) of the selected company,
     *  or null/undefined when nothing is picked. */
    value: string | null | undefined;
    onChange: (key: string | null) => void;
    placeholder?: string;
    /** When true, only ID-backed entries are pickable — slug-only entries
     *  are hidden. Used by the Mentions-a-company picker, which has no
     *  keyword fallback (the URL filter literally requires a numeric ID
     *  and silently drops slug-only picks). */
    requireId?: boolean;
  }

  let {
    value,
    onChange,
    placeholder = 'Pick a company…',
    requireId = false,
  }: Props = $props();

  let open = $state(false);
  let query = $state('');

  const selected = $derived(value ? companies.byKey(value) : undefined);

  const eligible = $derived(
    requireId
      ? companies.items.filter((c) => !!c.id)
      : companies.items
  );

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eligible;
    return eligible.filter((c) => {
      if (c.label.toLowerCase().includes(q)) return true;
      if (c.id?.includes(q)) return true;
      if (c.slug?.toLowerCase().includes(q)) return true;
      return false;
    });
  });

  const pick = (c: Company) => {
    onChange(companyKey(c));
    open = false;
    query = '';
  };

  const clear = () => {
    onChange(null);
    open = false;
    query = '';
  };

  const toggle = () => {
    open = !open;
    if (open) query = '';
  };

  // Click-outside collapse via Svelte action
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
          {#if selected.id}
            <span
              class="ml-1 rounded bg-brand-100 px-1 text-[9px] font-semibold uppercase text-brand-700 dark:bg-brand-900 dark:text-brand-200"
              title="Verified-employment precision"
            >
              ID
            </span>
          {:else if selected.slug}
            <span
              class="ml-1 rounded bg-slate-200 px-1 text-[9px] font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              title="Keyword fallback"
            >
              KW
            </span>
          {/if}
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
          placeholder="Search saved companies…"
          bind:value={query}
          use:focusOnMount
        />
      </div>
      <div class="max-h-52 overflow-y-auto">
        {#if companies.items.length === 0}
          <div class="p-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
            No saved companies yet.
            <button
              type="button"
              class="text-brand-600 hover:underline dark:text-brand-300"
              onclick={() => {
                open = false;
                router.go('companies');
              }}
            >
              Add one →
            </button>
          </div>
        {:else if requireId && eligible.length === 0}
          <div class="p-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
            No saved companies have a captured ID — this filter requires one.
            <button
              type="button"
              class="text-brand-600 hover:underline dark:text-brand-300"
              onclick={() => {
                open = false;
                router.go('companies');
              }}
            >
              Capture one →
            </button>
          </div>
        {:else if filtered.length === 0}
          <div class="p-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
            No matches.
          </div>
        {:else}
          <ul>
            {#each filtered as c (companyKey(c))}
              <li>
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-[12px] hover:bg-slate-100 dark:hover:bg-slate-700"
                  class:bg-brand-50={value === companyKey(c)}
                  onclick={() => pick(c)}
                >
                  <span class="min-w-0 flex-1 truncate">
                    <span class="font-medium">{c.label}</span>
                    {#if c.id}
                      <span class="ml-1 text-[10px] text-slate-400">
                        {c.id}
                      </span>
                    {:else if c.slug}
                      <span class="ml-1 text-[10px] text-slate-400">
                        {c.slug}
                      </span>
                    {/if}
                  </span>
                  {#if c.id}
                    <span
                      class="rounded bg-brand-100 px-1 text-[9px] font-semibold uppercase text-brand-700 dark:bg-brand-900 dark:text-brand-200"
                    >
                      ID
                    </span>
                  {:else}
                    <span
                      class="rounded bg-slate-200 px-1 text-[9px] font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    >
                      KW
                    </span>
                  {/if}
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  {/if}
</div>
