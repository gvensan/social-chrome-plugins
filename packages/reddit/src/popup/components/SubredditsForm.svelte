<script lang="ts">
  import { KeywordsField, Select, Toggle } from '@toolkit/core';
  import { ENTITY_SORT_OPTIONS } from '@lib/params';
  import type { EntitySort } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';

  const setField = <K extends keyof typeof builder.subreddits>(
    key: K,
    v: (typeof builder.subreddits)[K]
  ) => {
    builder.subreddits = { ...builder.subreddits, [key]: v };
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.subreddits.keywords}
    placeholder="topic, e.g. machine learning"
    onChange={(v) => setField('keywords', v)}
  />

  <div>
    <label class="label" for="rd-s-sort">Sort</label>
    <Select
      options={ENTITY_SORT_OPTIONS}
      value={builder.subreddits.sort}
      placeholder="Relevance"
      onChange={(v: EntitySort | undefined) => setField('sort', v)}
    />
  </div>
  <Toggle
    checked={builder.subreddits.includeOver18 ?? false}
    label="Include NSFW subs"
    onChange={(v) =>
      setField('includeOver18', v ? true : undefined)}
  />
</div>
