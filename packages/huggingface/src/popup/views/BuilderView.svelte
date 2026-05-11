<script lang="ts">
  import { buildUrl, type HFSearchType } from '@lib/url-builder';
  import ModelsForm from '../components/ModelsForm.svelte';
  import DatasetsForm from '../components/DatasetsForm.svelte';
  import SpacesForm from '../components/SpacesForm.svelte';
  import UrlPreview from '../components/UrlPreview.svelte';
  import { EditingBanner, SaveSearchDialog, Tabs } from '@toolkit/core';
  import { builder } from '../stores/builder.svelte';
  import { savedSearches } from '../stores/saved.svelte';

  const tabs: ReadonlyArray<{ id: HFSearchType; label: string }> = [
    { id: 'models', label: 'Models' },
    { id: 'datasets', label: 'Datasets' },
    { id: 'spaces', label: 'Spaces' },
  ];

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
  <Tabs items={tabs} active={builder.type} onChange={(id) => builder.setType(id)} />

  {#if editingEntry}
    <EditingBanner
      name={editingEntry.name}
      status={saveStatus}
      onExit={handleExitEdit}
      onSaveAsNew={handleSaveAsNew}
    />
  {/if}

  {#if builder.type === 'models'}
    <ModelsForm />
  {:else if builder.type === 'datasets'}
    <DatasetsForm />
  {:else}
    <SpacesForm />
  {/if}

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
  pluginName="Hugging Face Search Toolkit"
  namePlaceholder="e.g. LLM models — weekly"
  tagsPlaceholder="e.g. llm, weekly"
  onClose={() => (saveOpen = false)}
/>
