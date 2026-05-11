<script lang="ts">
  import { KeywordsField, Select } from '@toolkit/core';
  import { PRESET_OPTIONS } from '@lib/params';
  import type { YouTubeFilterPreset } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.search.keywords}
    placeholder={'e.g. "python tutorial" -beginner'}
    onChange={(v) => builder.update({ keywords: v })}
  />

  <div>
    <div class="label">Filter preset</div>
    <Select
      options={PRESET_OPTIONS}
      value={builder.search.preset}
      placeholder="No filter"
      onChange={(v: YouTubeFilterPreset | undefined) =>
        builder.update({ preset: v })}
    />
    <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
      Presets map to YouTube's <code>sp=</code> filter parameter. If YouTube
      changes a token, the URL still loads but the filter may degrade.
    </p>
  </div>
</div>
