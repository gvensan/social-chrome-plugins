<script lang="ts">
  import { REPO_SORT_OPTIONS } from '@lib/params';
  import { builder } from '../stores/builder.svelte';
  import { KeywordsField, Select, Toggle } from '@toolkit/core';

  const setField = <K extends keyof typeof builder.repositories>(
    key: K,
    v: (typeof builder.repositories)[K]
  ) => {
    builder.repositories = { ...builder.repositories, [key]: v };
  };

  const onText = (
    key:
      | 'user'
      | 'language'
      | 'topic'
      | 'license'
      | 'stars'
      | 'forks'
      | 'pushed'
  ) => (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    setField(key, v === '' ? undefined : v);
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.repositories.keywords}
    placeholder="e.g. graph database"
    onChange={(v) => setField('keywords', v)}
  />

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">User or org</div>
      <input
        class="input"
        placeholder="e.g. torvalds"
        value={builder.repositories.user ?? ''}
        oninput={onText('user')}
      />
    </div>
    <div>
      <div class="label">Language</div>
      <input
        class="input"
        placeholder="e.g. typescript"
        value={builder.repositories.language ?? ''}
        oninput={onText('language')}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Topic</div>
      <input
        class="input"
        placeholder="e.g. llm, machine-learning"
        value={builder.repositories.topic ?? ''}
        oninput={onText('topic')}
      />
    </div>
    <div>
      <div class="label">License</div>
      <input
        class="input"
        placeholder="e.g. mit, apache-2.0"
        value={builder.repositories.license ?? ''}
        oninput={onText('license')}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Stars</div>
      <input
        class="input"
        placeholder="e.g. >1000 or 100..500"
        value={builder.repositories.stars ?? ''}
        oninput={onText('stars')}
      />
    </div>
    <div>
      <div class="label">Forks</div>
      <input
        class="input"
        placeholder="e.g. >100"
        value={builder.repositories.forks ?? ''}
        oninput={onText('forks')}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Pushed</div>
      <input
        class="input"
        placeholder="e.g. >2024-01-01"
        value={builder.repositories.pushed ?? ''}
        oninput={onText('pushed')}
      />
    </div>
    <div>
      <div class="label">Sort</div>
      <Select
        options={REPO_SORT_OPTIONS}
        value={builder.repositories.sort}
        placeholder="Best match"
        onChange={(v) => setField('sort', v)}
      />
    </div>
  </div>

  <Toggle
    checked={builder.repositories.archived ?? false}
    label="Archived only"
    onChange={(v) => setField('archived', v ? true : undefined)}
  />
</div>
