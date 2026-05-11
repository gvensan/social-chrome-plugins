<script lang="ts">
  import { ISSUE_SORT_OPTIONS, ISSUE_STATE_OPTIONS } from '@lib/params';
  import { builder } from '../stores/builder.svelte';
  import { KeywordsField, Select, Toggle } from '@toolkit/core';

  const setField = <K extends keyof typeof builder.pullrequests>(
    key: K,
    v: (typeof builder.pullrequests)[K]
  ) => {
    builder.pullrequests = { ...builder.pullrequests, [key]: v };
  };

  const onText = (
    key:
      | 'repo'
      | 'user'
      | 'author'
      | 'assignee'
      | 'label'
      | 'created'
      | 'reviewRequested'
  ) => (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    setField(key, v === '' ? undefined : v);
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.pullrequests.keywords}
    placeholder="e.g. fix flaky test"
    onChange={(v) => setField('keywords', v)}
  />

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Repo (owner/name)</div>
      <input
        class="input"
        placeholder="e.g. nodejs/node"
        value={builder.pullrequests.repo ?? ''}
        oninput={onText('repo')}
      />
    </div>
    <div>
      <div class="label">User or org</div>
      <input
        class="input"
        placeholder="e.g. nodejs"
        value={builder.pullrequests.user ?? ''}
        oninput={onText('user')}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">State</div>
      <Select
        options={ISSUE_STATE_OPTIONS}
        value={builder.pullrequests.state}
        placeholder="Any"
        onChange={(v) => setField('state', v)}
      />
    </div>
    <div>
      <div class="label">Sort</div>
      <Select
        options={ISSUE_SORT_OPTIONS}
        value={builder.pullrequests.sort}
        placeholder="Best match"
        onChange={(v) => setField('sort', v)}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Author</div>
      <input
        class="input"
        placeholder="e.g. octocat or @me"
        value={builder.pullrequests.author ?? ''}
        oninput={onText('author')}
      />
    </div>
    <div>
      <div class="label">Assignee</div>
      <input
        class="input"
        placeholder="e.g. octocat or @me"
        value={builder.pullrequests.assignee ?? ''}
        oninput={onText('assignee')}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Label</div>
      <input
        class="input"
        placeholder="e.g. needs-review"
        value={builder.pullrequests.label ?? ''}
        oninput={onText('label')}
      />
    </div>
    <div>
      <div class="label">Created</div>
      <input
        class="input"
        placeholder="e.g. >2024-01-01"
        value={builder.pullrequests.created ?? ''}
        oninput={onText('created')}
      />
    </div>
  </div>

  <div>
    <div class="label">Review requested</div>
    <input
      class="input"
      placeholder="e.g. octocat or @me"
      value={builder.pullrequests.reviewRequested ?? ''}
      oninput={onText('reviewRequested')}
    />
  </div>

  <Toggle
    checked={builder.pullrequests.draft ?? false}
    label="Drafts only"
    onChange={(v) => setField('draft', v ? true : undefined)}
  />
</div>
