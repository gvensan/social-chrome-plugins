<script lang="ts">
  import { KeywordsField, Select, Tabs, Toggle } from '@toolkit/core';
  import {
    MEDIA_FILTER_OPTIONS,
    MODE_TABS,
    REPLY_FILTER_OPTIONS,
  } from '@lib/params';
  import type { MediaFilter, ReplyFilter, XSearchMode } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';

  const onNumber = (raw: string): number | undefined => {
    if (raw === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
</script>

<div class="space-y-3">
  <Tabs
    items={MODE_TABS}
    active={builder.mode}
    onChange={(id: XSearchMode) => builder.setMode(id)}
  />

  <KeywordsField
    value={builder.search.keywords}
    placeholder='e.g. "AI agents" OR "agentic"'
    onChange={(v) => builder.update({ keywords: v })}
  />

  <div class="label">People</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="x-from">From</label>
      <input
        id="x-from"
        class="input"
        placeholder="username"
        value={builder.search.fromUser ?? ''}
        oninput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          builder.update({ fromUser: v === '' ? undefined : v });
        }}
      />
    </div>
    <div>
      <label class="label" for="x-to">To</label>
      <input
        id="x-to"
        class="input"
        placeholder="username"
        value={builder.search.toUser ?? ''}
        oninput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          builder.update({ toUser: v === '' ? undefined : v });
        }}
      />
    </div>
  </div>
  <div>
    <label class="label" for="x-mention">Mentioning</label>
    <input
      id="x-mention"
      class="input"
      placeholder="username"
      value={builder.search.mentioning ?? ''}
      oninput={(e) => {
        const v = (e.currentTarget as HTMLInputElement).value;
        builder.update({ mentioning: v === '' ? undefined : v });
      }}
    />
  </div>

  <div class="label">Content</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="x-tag">Hashtag</label>
      <input
        id="x-tag"
        class="input"
        placeholder="AIagents"
        value={builder.search.hashtag ?? ''}
        oninput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          builder.update({ hashtag: v === '' ? undefined : v });
        }}
      />
    </div>
    <div>
      <label class="label" for="x-lang">Language</label>
      <input
        id="x-lang"
        class="input"
        placeholder="e.g. en, es, fr"
        value={builder.search.language ?? ''}
        oninput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          builder.update({ language: v === '' ? undefined : v });
        }}
      />
    </div>
  </div>

  <div class="label">Date range</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="x-since">Since</label>
      <input
        id="x-since"
        type="date"
        class="input"
        value={builder.search.since ?? ''}
        oninput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          builder.update({ since: v === '' ? undefined : v });
        }}
      />
    </div>
    <div>
      <label class="label" for="x-until">Until</label>
      <input
        id="x-until"
        type="date"
        class="input"
        value={builder.search.until ?? ''}
        oninput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          builder.update({ until: v === '' ? undefined : v });
        }}
      />
    </div>
  </div>

  <div class="label">Engagement floors</div>
  <div class="grid grid-cols-3 gap-2">
    <div>
      <label class="label" for="x-faves">Min faves</label>
      <input
        id="x-faves"
        type="number"
        min="0"
        class="input"
        placeholder="0"
        value={builder.search.minFaves ?? ''}
        oninput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          builder.update({ minFaves: onNumber(v) });
        }}
      />
    </div>
    <div>
      <label class="label" for="x-rt">Min RTs</label>
      <input
        id="x-rt"
        type="number"
        min="0"
        class="input"
        placeholder="0"
        value={builder.search.minRetweets ?? ''}
        oninput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          builder.update({ minRetweets: onNumber(v) });
        }}
      />
    </div>
    <div>
      <label class="label" for="x-replies">Min replies</label>
      <input
        id="x-replies"
        type="number"
        min="0"
        class="input"
        placeholder="0"
        value={builder.search.minReplies ?? ''}
        oninput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          builder.update({ minReplies: onNumber(v) });
        }}
      />
    </div>
  </div>

  <div class="label">Filters</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="x-replyf">Replies</label>
      <Select
        options={REPLY_FILTER_OPTIONS}
        value={builder.search.filterReplies}
        placeholder="Include replies"
        onChange={(v: ReplyFilter | undefined) =>
          builder.update({ filterReplies: v })}
      />
    </div>
    <div>
      <label class="label" for="x-mediaf">Media</label>
      <Select
        options={MEDIA_FILTER_OPTIONS}
        value={builder.search.filterMedia}
        placeholder="Any"
        onChange={(v: MediaFilter | undefined) =>
          builder.update({ filterMedia: v })}
      />
    </div>
  </div>
  <Toggle
    checked={builder.search.verifiedOnly ?? false}
    label="Verified accounts only"
    onChange={(v) => builder.update({ verifiedOnly: v || undefined })}
  />
  <Toggle
    checked={builder.search.excludeRetweets ?? false}
    label="Exclude retweets / reposts"
    onChange={(v) => builder.update({ excludeRetweets: v || undefined })}
  />

  <div class="label">List</div>
  <div>
    <label class="label" for="x-list">List ID</label>
    <input
      id="x-list"
      class="input"
      placeholder="numeric list ID"
      value={builder.search.list ?? ''}
      oninput={(e) => {
        const v = (e.currentTarget as HTMLInputElement).value;
        builder.update({ list: v === '' ? undefined : v });
      }}
    />
  </div>
</div>
