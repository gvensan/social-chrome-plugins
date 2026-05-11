<script lang="ts">
  import { buildUrl, type RedditSearchType } from '@lib/url-builder';
  import PostsForm from '../components/PostsForm.svelte';
  import CommentsForm from '../components/CommentsForm.svelte';
  import SubredditsForm from '../components/SubredditsForm.svelte';
  import UsersForm from '../components/UsersForm.svelte';
  import FeedForm from '../components/FeedForm.svelte';
  import UrlPreview from '../components/UrlPreview.svelte';
  import { EditingBanner, SaveSearchDialog, Tabs } from '@toolkit/core';
  import { builder } from '../stores/builder.svelte';
  import { savedSearches } from '../stores/saved.svelte';

  const tabs: ReadonlyArray<{ id: RedditSearchType; label: string }> = [
    { id: 'posts', label: 'Posts' },
    { id: 'comments', label: 'Comments' },
    { id: 'subreddits', label: 'Subs' },
    { id: 'users', label: 'Users' },
    { id: 'feed', label: 'Feed' },
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

  {#if builder.type === 'posts'}
    <PostsForm />
  {:else if builder.type === 'comments'}
    <CommentsForm />
  {:else if builder.type === 'subreddits'}
    <SubredditsForm />
  {:else if builder.type === 'users'}
    <UsersForm />
  {:else}
    <FeedForm />
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
  pluginName="Reddit Search Toolkit"
  namePlaceholder="e.g. Rust posts — weekly"
  tagsPlaceholder="e.g. rust, weekly"
  onClose={() => (saveOpen = false)}
/>
