<script lang="ts" generics="T">
  import type {
    SavedSearchesStore,
    SavedSearchBase,
  } from '../stores/saved.svelte';

  interface Props {
    item: SavedSearchBase<T>;
    store: SavedSearchesStore<T>;
    /** Returns the human-readable type label for an entry. Plugin-specific
     *  because each plugin has its own SearchInput discriminated union. */
    typeLabel: (item: SavedSearchBase<T>) => string;
    /** Open handler — receives the full item (some plugins want to mark
     *  it opened or do per-type routing). Default: log a warning. */
    onOpen: (item: SavedSearchBase<T>) => void;
    /** Edit handler — usually loads the item back into the builder.
     *  When omitted, the Edit button is hidden (some entry types are
     *  not editable, e.g. plain links). */
    onEdit?: (item: SavedSearchBase<T>) => void;
  }
  let { item, store, typeLabel, onOpen, onEdit }: Props = $props();

  let confirming = $state(false);

  const lastOpened = $derived.by(() => {
    if (!item.lastOpenedAt) return 'never opened';
    const diff = Date.now() - item.lastOpenedAt;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'opened today';
    if (days === 1) return 'opened yesterday';
    return `opened ${days}d ago`;
  });
</script>

<div class="card space-y-1.5">
  <div class="flex items-start justify-between gap-2">
    <div class="min-w-0 flex-1">
      <div class="truncate text-[12.5px] font-semibold">{item.name}</div>
      <div class="text-[10.5px] text-slate-500 dark:text-slate-400">
        {typeLabel(item)} · {lastOpened}
      </div>
      {#if item.tags.length}
        <div class="mt-1 flex flex-wrap gap-1">
          {#each item.tags as tag (tag)}
            <span class="chip !cursor-default">{tag}</span>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  <div class="flex gap-1.5">
    <button
      class="btn-primary flex-1"
      type="button"
      onclick={() => onOpen(item)}
    >
      Open
    </button>
    {#if onEdit}
      <button
        class="btn-secondary"
        type="button"
        onclick={() => onEdit?.(item)}
      >
        Edit
      </button>
    {/if}
    <button
      class="btn-secondary"
      type="button"
      onclick={() => store.duplicate(item.id)}
    >
      Dup
    </button>
    {#if confirming}
      <button
        class="btn-secondary !bg-rose-600 !text-white hover:!bg-rose-700"
        type="button"
        onclick={() => store.remove(item.id)}
      >
        Delete?
      </button>
    {:else}
      <button
        class="btn-ghost"
        type="button"
        aria-label="Delete"
        onclick={() => {
          confirming = true;
          setTimeout(() => (confirming = false), 2500);
        }}
      >
        ×
      </button>
    {/if}
  </div>
</div>
