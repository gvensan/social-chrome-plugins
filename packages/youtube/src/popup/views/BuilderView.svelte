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
    if (builder.editingSavedId && savedSearches.byId(builder.editingSavedId)) {
      const updated = await savedSearches.overwrite(builder.editingSavedId, {
        search: $state.snapshot(builder.current),
        url: buildUrl(builder.current),
      });
      if (updated) flashStatus('Updated');
      return;
    }
    saveOpen = true;
  };

  const handleSaveAsNew = () => {
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
  pluginName="YouTube Search Toolkit"
  namePlaceholder="e.g. Tech tutorials — weekly"
  tagsPlaceholder="e.g. tech, tutorial"
  onClose={() => (saveOpen = false)}
/>
