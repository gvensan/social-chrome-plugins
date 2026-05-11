<script lang="ts" generics="T">
  import type {
    SavedSearchesStore,
    SavedSearchBase,
  } from '../stores/saved.svelte';

  interface Props {
    open: boolean;
    /** Plugin's current SearchInput-like value. Stored opaquely. */
    search: T;
    /** Pre-built URL for the search. The dialog uses it for duplicate
     *  detection and persistence. */
    url: string;
    /** The plugin's saved-searches store instance. */
    store: SavedSearchesStore<T>;
    /** When set, Save overwrites this existing entry instead of
     *  creating a new one. The dialog still opens (so the user can
     *  rename/retag), but the action is in-place update. Pair with
     *  `dismissOnExistingEdit` to skip the dialog entirely. */
    editingId?: string;
    /** Plugin name for diagnostic console.error logs. */
    pluginName?: string;
    namePlaceholder?: string;
    tagsPlaceholder?: string;
    onClose: () => void;
    onSaved?: (entry: SavedSearchBase<T>) => void;
  }
  let {
    open,
    search,
    url,
    store,
    editingId,
    pluginName = 'Toolkit',
    namePlaceholder = 'e.g. Weekly digest',
    tagsPlaceholder = 'e.g. weekly, hiring',
    onClose,
    onSaved,
  }: Props = $props();

  let name = $state('');
  let tagsInput = $state('');
  let nameInput: HTMLInputElement | undefined = $state();
  let saving = $state(false);
  let errorMessage = $state('');
  let savedConfirmation = $state('');

  // When editing an existing entry, prefill name/tags and skip the
  // duplicate-by-URL hint (we know it duplicates — that's the whole
  // point of editing).
  const editingEntry = $derived(
    open && editingId ? store.byId(editingId) : undefined
  );

  const existing = $derived(
    open && !editingId ? store.findByUrl(url) : undefined
  );

  $effect(() => {
    if (open) {
      savedConfirmation = '';
      errorMessage = '';
      if (editingEntry) {
        name = editingEntry.name;
        tagsInput = editingEntry.tags.join(', ');
      }
      queueMicrotask(() => nameInput?.focus());
    }
  });

  const reset = () => {
    name = '';
    tagsInput = '';
    errorMessage = '';
  };

  /** One-click "Update existing instead of saving a new copy" path —
   *  triggered from the duplicate-URL banner. Overwrites the matching
   *  entry's search/url/tags in place, leaves name/createdAt intact. */
  const overwriteExisting = async (entry: SavedSearchBase<T>) => {
    if (saving) return;
    saving = true;
    errorMessage = '';
    try {
      const updated = await store.overwrite(entry.id, {
        search: $state.snapshot(search) as T,
        url,
      });
      if (updated) onSaved?.(updated);
      savedConfirmation = `Updated "${entry.name}".`;
      setTimeout(() => {
        savedConfirmation = '';
        onClose();
      }, 900);
    } catch (err) {
      errorMessage =
        err instanceof Error ? err.message : 'Could not save. Try again.';
      console.error(`[${pluginName}] overwrite failed`, err);
    } finally {
      saving = false;
    }
  };

  const submit = async () => {
    if (saving) return;
    saving = true;
    errorMessage = '';
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      let saved: SavedSearchBase<T> | undefined;
      if (editingId && store.byId(editingId)) {
        // In-place update — preserve id, createdAt, lastOpenedAt.
        await store.update(editingId, {
          name: name.trim() || 'Untitled search',
          tags,
          search: $state.snapshot(search) as T,
          url,
        });
        saved = store.byId(editingId);
      } else {
        saved = await store.create({
          name: name.trim() || `Saved ${new Date().toLocaleString()}`,
          tags,
          search,
          url,
        });
      }
      reset();
      if (saved) onSaved?.(saved);
      savedConfirmation = editingId
        ? `Updated "${saved?.name ?? 'entry'}".`
        : `Saved as "${saved?.name ?? 'entry'}".`;
      setTimeout(() => {
        savedConfirmation = '';
        onClose();
      }, 900);
    } catch (err) {
      errorMessage =
        err instanceof Error ? err.message : 'Could not save. Try again.';
      console.error(`[${pluginName}] save failed`, err);
    } finally {
      saving = false;
    }
  };
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <button
      type="button"
      class="absolute inset-0 cursor-default"
      aria-label="Close"
      onclick={onClose}
    ></button>
    <div
      class="relative w-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800"
    >
      <h2 class="mb-2 text-[13px] font-semibold">
        {editingId ? 'Update saved search' : 'Save search'}
      </h2>
      {#if existing}
        <div
          class="mb-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          <p class="leading-snug">
            This same search URL is already saved as “{existing.name}”.
            Hitting Save below creates a second entry with the same URL.
          </p>
          <button
            type="button"
            class="mt-1 text-amber-800 underline hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100"
            onclick={() => {
              // Pivot from "save new" to "overwrite existing" without
              // forcing the user to cancel + navigate to Saved + Edit.
              void overwriteExisting(existing);
            }}
            disabled={saving}
          >
            Update “{existing.name}” instead
          </button>
        </div>
      {/if}
      <div class="space-y-2">
        <div>
          <div class="label">Name</div>
          <input
            class="input"
            placeholder={namePlaceholder}
            bind:this={nameInput}
            bind:value={name}
          />
        </div>
        <div>
          <div class="label">Tags (comma-separated)</div>
          <input
            class="input"
            placeholder={tagsPlaceholder}
            bind:value={tagsInput}
          />
        </div>
      </div>
      {#if savedConfirmation}
        <p
          class="mt-2 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {savedConfirmation}
        </p>
      {:else if errorMessage}
        <p
          class="mt-2 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200"
        >
          {errorMessage}
        </p>
      {/if}
      <div class="mt-3 flex justify-end gap-1.5">
        <button
          class="btn-ghost"
          type="button"
          onclick={onClose}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          class="btn-primary"
          type="button"
          onclick={submit}
          disabled={saving || !!savedConfirmation}
        >
          {saving ? 'Saving…' : editingId ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  </div>
{/if}
