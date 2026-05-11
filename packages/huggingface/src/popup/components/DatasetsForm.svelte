<script lang="ts">
  import { KeywordsField, Select } from '@toolkit/core';
  import {
    DIRECTION_OPTIONS,
    MODALITY_OPTIONS,
    MULTILINGUALITY_OPTIONS,
    SIZE_CATEGORY_OPTIONS,
    SORT_OPTIONS,
  } from '@lib/params';
  import type {
    Multilinguality,
    SortDirection,
    SortKey,
  } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';

  const setField = <K extends keyof typeof builder.datasets>(
    key: K,
    v: (typeof builder.datasets)[K]
  ) => {
    builder.datasets = { ...builder.datasets, [key]: v };
  };

  const onText =
    (
      key:
        | 'taskCategory'
        | 'taskId'
        | 'language'
        | 'license'
        | 'sourceDataset'
    ) =>
    (e: Event) => {
      const v = (e.currentTarget as HTMLInputElement).value;
      setField(key, v === '' ? undefined : v);
    };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.datasets.keywords}
    placeholder='e.g. "common voice" or "instruction tuning"'
    onChange={(v) => setField('keywords', v)}
  />

  <div class="label">Task</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hf-tc">Task category</label>
      <input
        id="hf-tc"
        class="input"
        placeholder="text-classification"
        value={builder.datasets.taskCategory ?? ''}
        oninput={onText('taskCategory')}
      />
    </div>
    <div>
      <label class="label" for="hf-ti">Task id</label>
      <input
        id="hf-ti"
        class="input"
        placeholder="sentiment-classification"
        value={builder.datasets.taskId ?? ''}
        oninput={onText('taskId')}
      />
    </div>
  </div>

  <div class="label">License & language</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hf-d-lic">License</label>
      <input
        id="hf-d-lic"
        class="input"
        placeholder="apache-2.0, cc-by-4.0"
        value={builder.datasets.license ?? ''}
        oninput={onText('license')}
      />
    </div>
    <div>
      <label class="label" for="hf-d-lang">Language</label>
      <input
        id="hf-d-lang"
        class="input"
        placeholder="en, fr, multilingual"
        value={builder.datasets.language ?? ''}
        oninput={onText('language')}
      />
    </div>
  </div>

  <div class="label">Shape</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hf-mod">Modality</label>
      <Select
        options={MODALITY_OPTIONS}
        value={builder.datasets.modality}
        placeholder="Any"
        onChange={(v: string | undefined) => setField('modality', v)}
      />
    </div>
    <div>
      <label class="label" for="hf-size">Size</label>
      <Select
        options={SIZE_CATEGORY_OPTIONS}
        value={builder.datasets.sizeCategory}
        placeholder="Any size"
        onChange={(v: string | undefined) => setField('sizeCategory', v)}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hf-multi">Multilinguality</label>
      <Select
        options={MULTILINGUALITY_OPTIONS}
        value={builder.datasets.multilinguality}
        placeholder="Any"
        onChange={(v: Multilinguality | undefined) =>
          setField('multilinguality', v)}
      />
    </div>
    <div>
      <label class="label" for="hf-src">Source dataset</label>
      <input
        id="hf-src"
        class="input"
        placeholder="upstream slug (optional)"
        value={builder.datasets.sourceDataset ?? ''}
        oninput={onText('sourceDataset')}
      />
    </div>
  </div>

  <div class="label">Sort</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hf-d-sort">Sort</label>
      <Select
        options={SORT_OPTIONS}
        value={builder.datasets.sort}
        placeholder="Trending"
        onChange={(v: SortKey | undefined) => setField('sort', v)}
      />
    </div>
    <div>
      <label class="label" for="hf-d-dir">Direction</label>
      <Select
        options={DIRECTION_OPTIONS}
        value={builder.datasets.direction}
        placeholder="Descending"
        onChange={(v: SortDirection | undefined) =>
          setField('direction', v === 'desc' ? undefined : v)}
      />
    </div>
  </div>
</div>
