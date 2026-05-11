<script lang="ts">
  import { router, SavedSearchRow } from '@toolkit/core';
  import { PRESET_OPTIONS } from '@lib/params';
  import { savedSearches, type SavedSearch } from '../stores/saved.svelte';
  import { builder } from '../stores/builder.svelte';
  import { openUrl } from '../lib/open';

  let query = $state('');
  let activeTag = $state<string | null>(null);

  const tags = $derived(savedSearches.allTags());

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return savedSearches.items.filter((it) => {
      if (activeTag && !it.tags.includes(activeTag)) return false;
      if (q && !it.name.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  const typeLabel = (item: SavedSearch): string => {
    if (item.search.type === 'special') return 'Link';
    const p = item.search.input.preset;
    if (!p || p === 'none') return 'Search';
    return PRESET_OPTIONS.find((o) => o.value === p)?.label ?? 'Search';
  };

  const handleOpen = async (item: SavedSearch) => {
    openUrl(item.url);
    await savedSearches.markOpened(item.id);
  };

  const handleEdit = (item: SavedSearch) => {
    builder.loadSearch(item.search, { savedId: item.id });
    router.go('builder');
  };
</script>

<div class="space-y-3 p-3">
  {#if savedSearches.items.length === 0}
    <div
      class="rounded-lg border border-dashed border-slate-300 p-4 text-center text-[12px] text-slate-500 dark:border-slate-600 dark:text-slate-400"
    >
      <p class="mb-2">No saved searches yet.</p>
      <button
        class="btn-secondary"
        type="button"
        onclick={() => router.go('builder')}
      >
        Open the builder
      </button>
    </div>
  {:else}
    <input
      class="input"
      placeholder="Filter by name…"
      bind:value={query}
    />
    {#if tags.length}
      <div class="flex flex-wrap gap-1">
        <button
          class="chip"
          class:chip-active={activeTag === null}
          type="button"
          onclick={() => (activeTag = null)}>All</button
        >
        {#each tags as tag (tag)}
          <button
            class="chip"
            class:chip-active={activeTag === tag}
            type="button"
            onclick={() => (activeTag = activeTag === tag ? null : tag)}
            >{tag}</button
          >
        {/each}
      </div>
    {/if}
    {#each filtered as item (item.id)}
      {#if item.search.type === 'special'}
        <SavedSearchRow
          {item}
          store={savedSearches}
          {typeLabel}
          onOpen={handleOpen}
        />
      {:else}
        <SavedSearchRow
          {item}
          store={savedSearches}
          {typeLabel}
          onOpen={handleOpen}
          onEdit={handleEdit}
        />
      {/if}
    {/each}
    {#if filtered.length === 0}
      <p class="text-center text-[11px] text-slate-500">No matches.</p>
    {/if}
  {/if}
</div>
