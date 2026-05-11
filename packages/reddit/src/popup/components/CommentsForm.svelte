<script lang="ts">
  import { KeywordsField, Select, Toggle } from '@toolkit/core';
  import { COMMENT_SORT_OPTIONS, TIME_OPTIONS } from '@lib/params';
  import type { CommentSort, TimeWindow } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';

  const setField = <K extends keyof typeof builder.comments>(
    key: K,
    v: (typeof builder.comments)[K]
  ) => {
    builder.comments = { ...builder.comments, [key]: v };
  };

  const onText = (key: 'subreddit' | 'author') => (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    setField(key, v === '' ? undefined : v);
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.comments.keywords}
    placeholder="words to find inside comments"
    onChange={(v) => setField('keywords', v)}
  />

  <div class="label">Scope</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="rd-c-sub">Subreddit</label>
      <input
        id="rd-c-sub"
        class="input"
        placeholder="e.g. AskHistorians"
        value={builder.comments.subreddit ?? ''}
        oninput={onText('subreddit')}
      />
    </div>
    <div>
      <label class="label" for="rd-c-author">Author</label>
      <input
        id="rd-c-author"
        class="input"
        placeholder="username"
        value={builder.comments.author ?? ''}
        oninput={onText('author')}
      />
    </div>
  </div>

  <div class="label">Filters</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="rd-c-sort">Sort</label>
      <Select
        options={COMMENT_SORT_OPTIONS}
        value={builder.comments.sort}
        placeholder="Relevance"
        onChange={(v: CommentSort | undefined) => setField('sort', v)}
      />
    </div>
    <div>
      <label class="label" for="rd-c-time">Time window</label>
      <Select
        options={TIME_OPTIONS}
        value={builder.comments.time}
        placeholder="All time"
        onChange={(v: TimeWindow | undefined) => setField('time', v)}
      />
    </div>
  </div>
  <Toggle
    checked={builder.comments.includeOver18 ?? false}
    label="Include NSFW results"
    onChange={(v) =>
      setField('includeOver18', v ? true : undefined)}
  />
</div>
