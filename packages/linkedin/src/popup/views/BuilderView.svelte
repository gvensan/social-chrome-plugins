<script lang="ts">
  import { buildUrl, type SearchType } from '@lib/url-builder';
  import JobsForm from '../components/JobsForm.svelte';
  import PeopleForm from '../components/PeopleForm.svelte';
  import PostsForm from '../components/PostsForm.svelte';
  import UrlPreview from '../components/UrlPreview.svelte';
  import { EditingBanner, SaveSearchDialog, Tabs } from '@toolkit/core';
  import { builder } from '../stores/builder.svelte';
  import { savedSearches } from '../stores/saved.svelte';

  const tabs: ReadonlyArray<{ id: SearchType; label: string }> = [
    { id: 'posts', label: 'Posts' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'people', label: 'People' },
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

  {#if builder.context}
    <div
      class="flex items-center justify-between gap-2 rounded-lg border border-brand-200 bg-brand-50 px-2 py-1.5 dark:border-brand-700 dark:bg-brand-900/20"
    >
      <div class="min-w-0 flex-1">
        <div
          class="text-[9.5px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300"
        >
          Customizing
        </div>
        <div class="truncate text-[12px] font-semibold text-slate-800 dark:text-slate-100">
          {builder.context.title}
        </div>
      </div>
      <button
        type="button"
        class="btn-ghost shrink-0 text-[11px]"
        title="Clear template context (show all picker sections)"
        onclick={() => builder.clearContext()}
      >
        ×
      </button>
    </div>
  {/if}

  {#if editingEntry}
    <EditingBanner
      name={editingEntry.name}
      status={saveStatus}
      onExit={handleExitEdit}
      onSaveAsNew={handleSaveAsNew}
    />
  {/if}

  {#if builder.type === 'posts'}
    <PostsForm />
  {:else if builder.type === 'jobs'}
    <JobsForm />
  {:else}
    <PeopleForm />
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
  pluginName="LinkedIn Feed Toolkit"
  namePlaceholder="e.g. AI hiring posts — weekly"
  tagsPlaceholder="e.g. hiring, weekly"
  onClose={() => (saveOpen = false)}
/>
