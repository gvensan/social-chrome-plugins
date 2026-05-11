<script lang="ts">
  import { buildUrl } from '@lib/url-builder';
  import SearchForm from '../components/SearchForm.svelte';
  import UrlPreview from '../components/UrlPreview.svelte';
  import { EditingBanner, SaveSearchDialog } from '@toolkit/core';
  import { builder } from '../stores/builder.svelte';
  import { savedSearches } from '../stores/saved.svelte';

  let saveOpen = $state(false);
  let saveStatus = $state('');
  let statusTimer: ReturnType<typeof setTimeout> | null = null;

  // Resolve the saved entry being edited (if any). Reactive: if the
  // user clears edit mode or the entry is deleted out from under us,
  // this drops to undefined and the banner disappears.
  const editingEntry = $derived(
    builder.editingSavedId
      ? savedSearches.byId(builder.editingSavedId)
      : undefined
  );

  const flashStatus = (msg: string) => {
    saveStatus = msg;
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      saveStatus = '';
      statusTimer = null;
    }, 1800);
  };

  const handleSave = async () => {
    // Edit-mode Save: overwrite the existing entry in place, no
    // dialog prompt. Preserves id/name/createdAt/tags.
    if (builder.editingSavedId && savedSearches.byId(builder.editingSavedId)) {
      const updated = await savedSearches.overwrite(builder.editingSavedId, {
        search: $state.snapshot(builder.current),
        url: buildUrl(builder.current),
      });
      if (updated) flashStatus('Updated');
      return;
    }
    // Otherwise: open the Save dialog to capture name/tags.
    saveOpen = true;
  };

  const handleSaveAsNew = () => {
    // "Save as new" forks the edited search into a fresh entry. The
    // dialog opens in create mode (editingId omitted below).
    saveOpen = true;
  };

  const handleExitEdit = () => builder.exitEdit();
</script>

<div class="space-y-3 p-3">
  {#if editingEntry}
    <EditingBanner
      name={editingEntry.name}
      status={saveStatus}
      onExit={handleExitEdit}
      onSaveAsNew={handleSaveAsNew}
    />
  {/if}

  <SearchForm />

  <UrlPreview search={builder.current} onSave={handleSave} />

  <button
    class="btn-ghost w-full"
    type="button"
    onclick={() => builder.reset()}
  >
    Clear all fields
  </button>
</div>

<SaveSearchDialog
  open={saveOpen}
  search={builder.current}
  url={buildUrl(builder.current)}
  store={savedSearches}
  pluginName="Hacker News Search Toolkit"
  namePlaceholder="e.g. Show HN — weekly"
  tagsPlaceholder="e.g. show, weekly"
  onClose={() => (saveOpen = false)}
/>
