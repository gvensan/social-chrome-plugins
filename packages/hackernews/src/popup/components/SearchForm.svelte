<script lang="ts">
  import { KeywordsField, Select, Toggle } from '@toolkit/core';
  import {
    DATE_RANGE_OPTIONS,
    SORT_OPTIONS,
    TYPE_OPTIONS,
  } from '@lib/params';
  import type { HNDateRange, HNSort, HNType } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';

  const onNumber = (raw: string): number | undefined => {
    if (raw === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  // dateStart/dateEnd are stored as epoch seconds in the model. The
  // UI surfaces a date picker in YYYY-MM-DD form; we round to the
  // start of day in UTC for predictable behaviour.
  const epochToDateInput = (epoch: number | undefined): string => {
    if (typeof epoch !== 'number') return '';
    return new Date(epoch * 1000).toISOString().slice(0, 10);
  };

  const dateInputToEpoch = (raw: string): number | undefined => {
    if (raw === '') return undefined;
    const ms = Date.parse(raw + 'T00:00:00Z');
    if (!Number.isFinite(ms)) return undefined;
    return Math.floor(ms / 1000);
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.search.keywords}
    placeholder='e.g. "rust" or "show hn"'
    onChange={(v) => builder.update({ keywords: v })}
  />

  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hn-type">Type</label>
      <Select
        options={TYPE_OPTIONS}
        value={builder.search.type}
        placeholder="Everything"
        onChange={(v: HNType | undefined) => builder.update({ type: v })}
      />
    </div>
    <div>
      <label class="label" for="hn-sort">Sort</label>
      <Select
        options={SORT_OPTIONS}
        value={builder.search.sort}
        placeholder="By popularity"
        onChange={(v: HNSort | undefined) => builder.update({ sort: v })}
      />
    </div>
  </div>

  <div>
    <label class="label" for="hn-author">Author</label>
    <input
      id="hn-author"
      class="input"
      placeholder="HN username (e.g. pg)"
      value={builder.search.author ?? ''}
      oninput={(e) => {
        const v = (e.currentTarget as HTMLInputElement).value;
        builder.update({ author: v === '' ? undefined : v });
      }}
    />
  </div>

  <div class="label">Date range</div>
  <div>
    <Select
      options={DATE_RANGE_OPTIONS}
      value={builder.search.dateRange}
      placeholder="All time"
      onChange={(v: HNDateRange | undefined) =>
        builder.update({ dateRange: v })}
    />
  </div>

  {#if builder.search.dateRange === 'custom'}
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="label" for="hn-d-start">Start</label>
        <input
          id="hn-d-start"
          type="date"
          class="input"
          value={epochToDateInput(builder.search.dateStart)}
          oninput={(e) => {
            const v = (e.currentTarget as HTMLInputElement).value;
            builder.update({ dateStart: dateInputToEpoch(v) });
          }}
        />
      </div>
      <div>
        <label class="label" for="hn-d-end">End</label>
        <input
          id="hn-d-end"
          type="date"
          class="input"
          value={epochToDateInput(builder.search.dateEnd)}
          oninput={(e) => {
            const v = (e.currentTarget as HTMLInputElement).value;
            builder.update({ dateEnd: dateInputToEpoch(v) });
          }}
        />
      </div>
    </div>
  {/if}

  <div class="label">Engagement floors</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="hn-pts">Min points</label>
      <input
        id="hn-pts"
        type="number"
        min="0"
        class="input"
        placeholder="0"
        value={builder.search.minPoints ?? ''}
        oninput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          builder.update({ minPoints: onNumber(v) });
        }}
      />
    </div>
    <div>
      <label class="label" for="hn-cmts">Min comments</label>
      <input
        id="hn-cmts"
        type="number"
        min="0"
        class="input"
        placeholder="0"
        value={builder.search.minComments ?? ''}
        oninput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          builder.update({ minComments: onNumber(v) });
        }}
      />
    </div>
  </div>

  <div>
    <label class="label" for="hn-story">Story id (for comment scoping)</label>
    <input
      id="hn-story"
      class="input"
      placeholder="numeric HN story id (optional)"
      value={builder.search.storyId ?? ''}
      oninput={(e) => {
        const v = (e.currentTarget as HTMLInputElement).value;
        builder.update({ storyId: v === '' ? undefined : v });
      }}
    />
    <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
      Restricts comments to those under a single story (paste the id from
      the HN URL).
    </p>
  </div>

  <Toggle
    checked={builder.search.prefix === false}
    label="Exact match (disable prefix matching)"
    onChange={(v) => builder.update({ prefix: v ? false : undefined })}
  />
</div>
