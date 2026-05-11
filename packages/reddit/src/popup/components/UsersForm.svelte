<script lang="ts">
  import { KeywordsField, Select } from '@toolkit/core';
  import { ENTITY_SORT_OPTIONS } from '@lib/params';
  import type { EntitySort } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';

  const setField = <K extends keyof typeof builder.users>(
    key: K,
    v: (typeof builder.users)[K]
  ) => {
    builder.users = { ...builder.users, [key]: v };
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.users.keywords}
    placeholder="username substring"
    onChange={(v) => setField('keywords', v)}
  />

  <div>
    <label class="label" for="rd-u-sort">Sort</label>
    <Select
      options={ENTITY_SORT_OPTIONS}
      value={builder.users.sort}
      placeholder="Relevance"
      onChange={(v: EntitySort | undefined) => setField('sort', v)}
    />
  </div>
</div>
