<script lang="ts">
  import { Select, Tabs } from '@toolkit/core';
  import {
    FEED_TARGET_OPTIONS,
    GLOBAL_SCOPE_OPTIONS,
    LISTING_SORT_OPTIONS,
    TIME_OPTIONS,
    USER_TAB_OPTIONS,
    type FeedTargetKind,
  } from '@lib/params';
  import type {
    FeedTarget,
    ListingSort,
    TimeWindow,
  } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';

  // Derive the target kind from the current target shape so the tabs
  // reflect what's loaded from a saved search or template.
  const targetKind = $derived<FeedTargetKind>(
    builder.feed.target?.kind ?? 'subreddits'
  );

  const setTarget = (target: FeedTarget | undefined) => {
    builder.feed = { ...builder.feed, target };
  };

  const setKind = (kind: FeedTargetKind) => {
    if (kind === 'subreddits') {
      setTarget({ kind: 'subreddits', names: [] });
    } else if (kind === 'global') {
      setTarget({ kind: 'global', scope: 'all' });
    } else {
      setTarget({ kind: 'user', username: '', tab: 'submitted' });
    }
  };

  // Subreddits target — render names as a single comma/plus-separated
  // input. + matches Reddit's URL syntax exactly; comma is the friendly
  // typing form. Whitespace tolerated.
  const subsValue = $derived(() => {
    const t = builder.feed.target;
    if (t?.kind !== 'subreddits') return '';
    return t.names.join('+');
  });

  const onSubsInput = (e: Event) => {
    const raw = (e.currentTarget as HTMLInputElement).value;
    const names = raw
      .split(/[+,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setTarget({ kind: 'subreddits', names });
  };

  const onUsernameInput = (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    const t = builder.feed.target;
    if (t?.kind !== 'user') return;
    setTarget({ ...t, username: v });
  };

  const setUserTab = (tab: 'submitted' | 'comments' | undefined) => {
    const t = builder.feed.target;
    if (t?.kind !== 'user' || !tab) return;
    setTarget({ ...t, tab });
  };

  const setGlobalScope = (scope: 'all' | 'popular' | undefined) => {
    if (!scope) return;
    setTarget({ kind: 'global', scope });
  };

  const setSort = (v: ListingSort | undefined) => {
    builder.feed = { ...builder.feed, sort: v };
  };

  const setTime = (v: TimeWindow | undefined) => {
    builder.feed = { ...builder.feed, time: v };
  };

  const onGeoInput = (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value.trim();
    builder.feed = {
      ...builder.feed,
      geoFilter: v === '' ? undefined : v.toUpperCase(),
    };
  };

  const sortAcceptsTime = $derived(
    builder.feed.sort === 'top' || builder.feed.sort === 'controversial'
  );
</script>

<div class="space-y-3">
  <Tabs items={FEED_TARGET_OPTIONS} active={targetKind} onChange={setKind} />

  {#if targetKind === 'subreddits'}
    <div>
      <label class="label" for="rd-f-subs">Subreddit(s)</label>
      <input
        id="rd-f-subs"
        class="input"
        placeholder="e.g. rust+golang+typescript"
        value={subsValue()}
        oninput={onSubsInput}
      />
      <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
        One sub for a normal feed; multiple (plus-separated) creates a
        multireddit — a single feed across all of them.
      </p>
    </div>
  {:else if targetKind === 'global'}
    <div>
      <label class="label" for="rd-f-scope">Scope</label>
      <Select
        options={GLOBAL_SCOPE_OPTIONS}
        value={
          builder.feed.target?.kind === 'global'
            ? builder.feed.target.scope
            : undefined
        }
        placeholder="r/all"
        onChange={setGlobalScope}
      />
    </div>
  {:else}
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="label" for="rd-f-user">Username</label>
        <input
          id="rd-f-user"
          class="input"
          placeholder="username"
          value={
            builder.feed.target?.kind === 'user'
              ? builder.feed.target.username
              : ''
          }
          oninput={onUsernameInput}
        />
      </div>
      <div>
        <label class="label" for="rd-f-tab">Tab</label>
        <Select
          options={USER_TAB_OPTIONS}
          value={
            builder.feed.target?.kind === 'user'
              ? builder.feed.target.tab
              : undefined
          }
          placeholder="Submissions"
          onChange={setUserTab}
        />
      </div>
    </div>
  {/if}

  <div class="label">Sort + time</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="rd-f-sort">Sort</label>
      <Select
        options={LISTING_SORT_OPTIONS}
        value={builder.feed.sort}
        placeholder="Hot"
        onChange={setSort}
      />
    </div>
    <div>
      <label class="label" for="rd-f-time">Time window</label>
      <Select
        options={TIME_OPTIONS}
        value={builder.feed.time}
        placeholder="All time"
        onChange={setTime}
      />
      {#if !sortAcceptsTime}
        <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
          Time window only applies to Top / Controversial.
        </p>
      {/if}
    </div>
  </div>

  <div>
    <label class="label" for="rd-f-geo">Geo filter</label>
    <input
      id="rd-f-geo"
      class="input"
      placeholder="e.g. US, GB, DE (optional)"
      value={builder.feed.geoFilter ?? ''}
      oninput={onGeoInput}
    />
    <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
      Restricts to posts geotagged for the given country code. Undocumented
      and best-effort; not all listings honor it.
    </p>
  </div>
</div>
