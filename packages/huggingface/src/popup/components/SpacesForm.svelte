<script lang="ts">
  import { KeywordsField, Select } from '@toolkit/core';
  import { DIRECTION_OPTIONS, SDK_OPTIONS, SORT_OPTIONS } from '@lib/params';
  import type { SortDirection, SortKey, SpaceSdk } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';

  const setField = <K extends keyof typeof builder.spaces>(
    key: K,
    v: (typeof builder.spaces)[K]
  ) => {
    builder.spaces = { ...builder.spaces, [key]: v };
  };

  const onText =
    (key: 'pipelineTag' | 'models' | 'datasets') => (e: Event) => {
      const v = (e.currentTarget as HTMLInputElement).value;
      setField(key, v === '' ? undefined : v);
    };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.spaces.keywords}
    placeholder='e.g. "chatbot" or "image upscaler"'
    onChange={(v) => setField('keywords', v)}
  />

  <div class="label">Framework & task</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hf-s-sdk">SDK</label>
      <Select
        options={SDK_OPTIONS}
        value={builder.spaces.sdk}
        placeholder="Any SDK"
        onChange={(v: SpaceSdk | undefined) => setField('sdk', v)}
      />
    </div>
    <div>
      <label class="label" for="hf-s-task">Pipeline tag</label>
      <input
        id="hf-s-task"
        class="input"
        placeholder="text-to-image"
        value={builder.spaces.pipelineTag ?? ''}
        oninput={onText('pipelineTag')}
      />
    </div>
  </div>

  <div class="label">Uses</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hf-s-models">Uses model</label>
      <input
        id="hf-s-models"
        class="input"
        placeholder="model slug (e.g. stabilityai/stable-diffusion-3-medium)"
        value={builder.spaces.models ?? ''}
        oninput={onText('models')}
      />
    </div>
    <div>
      <label class="label" for="hf-s-datasets">Uses dataset</label>
      <input
        id="hf-s-datasets"
        class="input"
        placeholder="dataset slug"
        value={builder.spaces.datasets ?? ''}
        oninput={onText('datasets')}
      />
    </div>
  </div>

  <div class="label">Sort</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hf-s-sort">Sort</label>
      <Select
        options={SORT_OPTIONS}
        value={builder.spaces.sort}
        placeholder="Trending"
        onChange={(v: SortKey | undefined) => setField('sort', v)}
      />
    </div>
    <div>
      <label class="label" for="hf-s-dir">Direction</label>
      <Select
        options={DIRECTION_OPTIONS}
        value={builder.spaces.direction}
        placeholder="Descending"
        onChange={(v: SortDirection | undefined) =>
          setField('direction', v === 'desc' ? undefined : v)}
      />
    </div>
  </div>
</div>
