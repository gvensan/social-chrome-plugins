<script lang="ts">
  import { people, personKey } from '../stores/people.svelte';
  import type { Person } from '../stores/people.svelte';
  import { router } from '@toolkit/core';

  interface Props {
    value: string | null | undefined;
    onChange: (key: string | null) => void;
    placeholder?: string;
    /** When true, only token-bearing entries are pickable. Used by the
     *  Mentions-a-person picker (and self-filter use cases) where the
     *  URL filter literally requires a profile token and silently drops
     *  entries that have only id/vanity. */
    requireToken?: boolean;
  }

  let {
    value,
    onChange,
    placeholder = 'Pick a person…',
    requireToken = false,
  }: Props = $props();

  let open = $state(false);
  let query = $state('');

  const selected = $derived(value ? people.byKey(value) : undefined);

  const eligible = $derived(
    requireToken ? people.items.filter((p) => !!p.token) : people.items
  );

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eligible;
    return eligible.filter((p) => {
      if (p.label.toLowerCase().includes(q)) return true;
      if (p.token?.toLowerCase().includes(q)) return true;
      if (p.id?.includes(q)) return true;
      if (p.vanity?.toLowerCase().includes(q)) return true;
      return false;
    });
  });

  const pick = (p: Person) => {
    onChange(personKey(p));
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
              title="Verified-author precision"
            >
              ID
            </span>
          {:else if selected.vanity}
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
          placeholder="Search saved people…"
          bind:value={query}
          use:focusOnMount
        />
      </div>
      <div class="max-h-52 overflow-y-auto">
        {#if people.items.length === 0}
          <div class="p-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
            No saved people yet.
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
        {:else if requireToken && eligible.length === 0}
          <div class="p-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
            No saved people have a captured profile token — this filter
            requires one.
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
            {#each filtered as p (personKey(p))}
              <li>
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-[12px] hover:bg-slate-100 dark:hover:bg-slate-700"
                  class:bg-brand-50={value === personKey(p)}
                  onclick={() => pick(p)}
                >
                  <span class="min-w-0 flex-1 truncate">
                    <span class="font-medium">{p.label}</span>
                    {#if p.id}
                      <span class="ml-1 text-[10px] text-slate-400">
                        {p.id}
                      </span>
                    {:else if p.vanity}
                      <span class="ml-1 text-[10px] text-slate-400">
                        {p.vanity}
                      </span>
                    {/if}
                  </span>
                  {#if p.id}
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
