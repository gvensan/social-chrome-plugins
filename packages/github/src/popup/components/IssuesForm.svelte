<script lang="ts">
  import { ISSUE_SORT_OPTIONS, ISSUE_STATE_OPTIONS } from '@lib/params';
  import { builder } from '../stores/builder.svelte';
  import { KeywordsField, Select, Toggle } from '@toolkit/core';

  const setField = <K extends keyof typeof builder.issues>(
    key: K,
    v: (typeof builder.issues)[K]
  ) => {
    builder.issues = { ...builder.issues, [key]: v };
  };

  const onText = (
    key:
      | 'repo'
      | 'user'
      | 'language'
      | 'author'
      | 'assignee'
      | 'label'
      | 'created'
  ) => (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    setField(key, v === '' ? undefined : v);
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.issues.keywords}
    placeholder="e.g. crash on startup"
    onChange={(v) => setField('keywords', v)}
  />

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Repo (owner/name)</div>
      <input
        class="input"
        placeholder="e.g. nodejs/node"
        value={builder.issues.repo ?? ''}
        oninput={onText('repo')}
      />
    </div>
    <div>
      <div class="label">User or org</div>
      <input
        class="input"
        placeholder="e.g. nodejs"
        value={builder.issues.user ?? ''}
        oninput={onText('user')}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">State</div>
      <Select
        options={ISSUE_STATE_OPTIONS}
        value={builder.issues.state}
        placeholder="Any"
        onChange={(v) => setField('state', v)}
      />
    </div>
    <div>
      <div class="label">Sort</div>
      <Select
        options={ISSUE_SORT_OPTIONS}
        value={builder.issues.sort}
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
        value={builder.issues.author ?? ''}
        oninput={onText('author')}
      />
    </div>
    <div>
      <div class="label">Assignee</div>
      <input
        class="input"
        placeholder="e.g. octocat or @me"
        value={builder.issues.assignee ?? ''}
        oninput={onText('assignee')}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Label</div>
      <input
        class="input"
        placeholder='e.g. bug or "good first issue"'
        value={builder.issues.label ?? ''}
        oninput={onText('label')}
      />
    </div>
    <div>
      <div class="label">Language</div>
      <input
        class="input"
        placeholder="e.g. typescript"
        value={builder.issues.language ?? ''}
        oninput={onText('language')}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Created</div>
      <input
        class="input"
        placeholder="e.g. >2024-01-01"
        value={builder.issues.created ?? ''}
        oninput={onText('created')}
      />
    </div>
    <div class="flex items-end">
      <Toggle
        checked={builder.issues.unassigned ?? false}
        label="No assignee"
        onChange={(v) => setField('unassigned', v ? true : undefined)}
      />
    </div>
  </div>
</div>
