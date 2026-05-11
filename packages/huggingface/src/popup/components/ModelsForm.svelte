<script lang="ts">
  import { KeywordsField, Select } from '@toolkit/core';
  import { DIRECTION_OPTIONS, SORT_OPTIONS } from '@lib/params';
  import type { SortDirection, SortKey } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';

  const setField = <K extends keyof typeof builder.models>(
    key: K,
    v: (typeof builder.models)[K]
  ) => {
    builder.models = { ...builder.models, [key]: v };
  };

  const onText =
    (
      key: 'pipelineTag' | 'library' | 'language' | 'license' | 'dataset' | 'author'
    ) =>
    (e: Event) => {
      const v = (e.currentTarget as HTMLInputElement).value;
      setField(key, v === '' ? undefined : v);
    };

  const otherText = $derived((builder.models.other ?? []).join(', '));

  const onOtherInput = (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    const tags = v
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setField('other', tags.length === 0 ? undefined : tags);
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.models.keywords}
    placeholder='e.g. "llama 3" or "embedding"'
    onChange={(v) => setField('keywords', v)}
  />

  <div class="label">Task & framework</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hf-task">Pipeline tag</label>
      <input
        id="hf-task"
        class="input"
        placeholder="text-generation"
        value={builder.models.pipelineTag ?? ''}
        oninput={onText('pipelineTag')}
      />
    </div>
    <div>
      <label class="label" for="hf-lib">Library</label>
      <input
        id="hf-lib"
        class="input"
        placeholder="transformers, diffusers, gguf"
        value={builder.models.library ?? ''}
        oninput={onText('library')}
      />
    </div>
  </div>

  <div class="label">License & language</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hf-lic">License</label>
      <input
        id="hf-lic"
        class="input"
        placeholder="apache-2.0, mit, llama2"
        value={builder.models.license ?? ''}
        oninput={onText('license')}
      />
    </div>
    <div>
      <label class="label" for="hf-lang">Language</label>
      <input
        id="hf-lang"
        class="input"
        placeholder="en, fr, multilingual"
        value={builder.models.language ?? ''}
        oninput={onText('language')}
      />
    </div>
  </div>

  <div class="label">Source & author</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hf-ds">Trained on dataset</label>
      <input
        id="hf-ds"
        class="input"
        placeholder="dataset slug (e.g. wikipedia)"
        value={builder.models.dataset ?? ''}
        oninput={onText('dataset')}
      />
    </div>
    <div>
      <label class="label" for="hf-auth">Author / org</label>
      <input
        id="hf-auth"
        class="input"
        placeholder="meta-llama, mistralai"
        value={builder.models.author ?? ''}
        oninput={onText('author')}
      />
    </div>
  </div>

  <div>
    <label class="label" for="hf-other">Other tags</label>
    <input
      id="hf-other"
      class="input"
      placeholder="comma-separated (e.g. conversational, agent)"
      value={otherText}
      oninput={onOtherInput}
    />
    <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
      Each tag becomes an `other=&lt;tag&gt;` filter (AND-combined).
    </p>
  </div>

  <div class="label">Sort</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hf-sort">Sort</label>
      <Select
        options={SORT_OPTIONS}
        value={builder.models.sort}
        placeholder="Trending"
        onChange={(v: SortKey | undefined) => setField('sort', v)}
      />
    </div>
    <div>
      <label class="label" for="hf-dir">Direction</label>
      <Select
        options={DIRECTION_OPTIONS}
        value={builder.models.direction}
        placeholder="Descending"
        onChange={(v: SortDirection | undefined) =>
          setField('direction', v === 'desc' ? undefined : v)}
      />
    </div>
  </div>
</div>
