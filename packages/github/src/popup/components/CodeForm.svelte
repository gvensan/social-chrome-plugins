<script lang="ts">
  import { builder } from '../stores/builder.svelte';
  import { KeywordsField, Toggle } from '@toolkit/core';

  const setField = <K extends keyof typeof builder.code>(
    key: K,
    v: (typeof builder.code)[K]
  ) => {
    builder.code = { ...builder.code, [key]: v };
  };

  const onText = (
    key: 'user' | 'repo' | 'language' | 'path' | 'extension'
  ) => (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    setField(key, v === '' ? undefined : v);
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.code.keywords}
    placeholder="e.g. createServer"
    onChange={(v) => setField('keywords', v)}
  />

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">User or org</div>
      <input
        class="input"
        placeholder="e.g. vercel"
        value={builder.code.user ?? ''}
        oninput={onText('user')}
      />
    </div>
    <div>
      <div class="label">Repo (owner/name)</div>
      <input
        class="input"
        placeholder="e.g. sveltejs/svelte"
        value={builder.code.repo ?? ''}
        oninput={onText('repo')}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Language</div>
      <input
        class="input"
        placeholder="e.g. python"
        value={builder.code.language ?? ''}
        oninput={onText('language')}
      />
    </div>
    <div>
      <div class="label">Extension</div>
      <input
        class="input"
        placeholder="e.g. ts"
        value={builder.code.extension ?? ''}
        oninput={onText('extension')}
      />
    </div>
  </div>

  <div>
    <div class="label">Path</div>
    <input
      class="input"
      placeholder="e.g. src/lib"
      value={builder.code.path ?? ''}
      oninput={onText('path')}
    />
  </div>

  <div class="space-y-1.5">
    <Toggle
      checked={builder.code.inFile ?? false}
      label="Match file contents (in:file)"
      onChange={(v) => setField('inFile', v ? true : undefined)}
    />
    <Toggle
      checked={builder.code.inPath ?? false}
      label="Match file path (in:path)"
      onChange={(v) => setField('inPath', v ? true : undefined)}
    />
  </div>
</div>
