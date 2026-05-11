<script lang="ts">
  import { buildUrl, type GitHubSearchType } from '@lib/url-builder';
  import RepositoriesForm from '../components/RepositoriesForm.svelte';
  import CodeForm from '../components/CodeForm.svelte';
  import IssuesForm from '../components/IssuesForm.svelte';
  import PullRequestsForm from '../components/PullRequestsForm.svelte';
  import UsersForm from '../components/UsersForm.svelte';
  import UrlPreview from '../components/UrlPreview.svelte';
  import { EditingBanner, SaveSearchDialog, Tabs } from '@toolkit/core';
  import { builder } from '../stores/builder.svelte';
  import { savedSearches } from '../stores/saved.svelte';

  const tabs: ReadonlyArray<{ id: GitHubSearchType; label: string }> = [
    { id: 'repositories', label: 'Repos' },
    { id: 'code', label: 'Code' },
    { id: 'issues', label: 'Issues' },
    { id: 'pullrequests', label: 'PRs' },
    { id: 'users', label: 'Users' },
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

  {#if builder.type === 'repositories'}
    <RepositoriesForm />
  {:else if builder.type === 'code'}
    <CodeForm />
  {:else if builder.type === 'issues'}
    <IssuesForm />
  {:else if builder.type === 'pullrequests'}
    <PullRequestsForm />
  {:else}
    <UsersForm />
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
  pluginName="GitHub Search Toolkit"
  namePlaceholder="e.g. Rust top repos — weekly"
  tagsPlaceholder="e.g. rust, weekly"
  onClose={() => (saveOpen = false)}
/>
