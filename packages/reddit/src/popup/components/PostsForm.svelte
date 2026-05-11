<script lang="ts">
  import { KeywordsField, Select, Toggle } from '@toolkit/core';
  import {
    POST_SORT_OPTIONS,
    SELF_TYPE_OPTIONS,
    TIME_OPTIONS,
  } from '@lib/params';
  import type { PostSort, TimeWindow } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';

  const setField = <K extends keyof typeof builder.posts>(
    key: K,
    v: (typeof builder.posts)[K]
  ) => {
    builder.posts = { ...builder.posts, [key]: v };
  };

  const onText =
    (
      key:
        | 'subreddit'
        | 'author'
        | 'flair'
        | 'title'
        | 'selftext'
        | 'url'
        | 'site'
    ) =>
    (e: Event) => {
      const v = (e.currentTarget as HTMLInputElement).value;
      setField(key, v === '' ? undefined : v);
    };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.posts.keywords}
    placeholder='e.g. "AI agents" OR "agentic"'
    onChange={(v) => setField('keywords', v)}
  />

  <div class="label">Scope</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="rd-sub">Subreddit</label>
      <input
        id="rd-sub"
        class="input"
        placeholder="e.g. programming"
        value={builder.posts.subreddit ?? ''}
        oninput={onText('subreddit')}
      />
    </div>
    <div>
      <label class="label" for="rd-author">Author</label>
      <input
        id="rd-author"
        class="input"
        placeholder="username"
        value={builder.posts.author ?? ''}
        oninput={onText('author')}
      />
    </div>
  </div>
  <div>
    <label class="label" for="rd-flair">Flair</label>
    <input
      id="rd-flair"
      class="input"
      placeholder='e.g. Question, Discussion, "Show & Tell"'
      value={builder.posts.flair ?? ''}
      oninput={onText('flair')}
    />
  </div>

  <div class="label">Match in</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="rd-title">Title contains</label>
      <input
        id="rd-title"
        class="input"
        placeholder="text in title"
        value={builder.posts.title ?? ''}
        oninput={onText('title')}
      />
    </div>
    <div>
      <label class="label" for="rd-self">Body contains</label>
      <input
        id="rd-self"
        class="input"
        placeholder="text in self-post body"
        value={builder.posts.selftext ?? ''}
        oninput={onText('selftext')}
      />
    </div>
  </div>

  <div class="label">Link target</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="rd-url">URL contains</label>
      <input
        id="rd-url"
        class="input"
        placeholder="substring in destination URL"
        value={builder.posts.url ?? ''}
        oninput={onText('url')}
      />
    </div>
    <div>
      <label class="label" for="rd-site">Domain</label>
      <input
        id="rd-site"
        class="input"
        placeholder="e.g. github.com"
        value={builder.posts.site ?? ''}
        oninput={onText('site')}
      />
    </div>
  </div>

  <div class="label">Filters</div>
  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="label" for="rd-self-type">Post type</label>
      <Select
        options={SELF_TYPE_OPTIONS}
        value={builder.posts.selfType}
        placeholder="Any"
        onChange={(v: 'self' | 'link' | undefined) =>
          setField('selfType', v)}
      />
    </div>
    <div>
      <label class="label" for="rd-sort">Sort</label>
      <Select
        options={POST_SORT_OPTIONS}
        value={builder.posts.sort}
        placeholder="Relevance"
        onChange={(v: PostSort | undefined) => setField('sort', v)}
      />
    </div>
  </div>
  <div>
    <label class="label" for="rd-time">Time window</label>
    <Select
      options={TIME_OPTIONS}
      value={builder.posts.time}
      placeholder="All time"
      onChange={(v: TimeWindow | undefined) => setField('time', v)}
    />
  </div>
  <Toggle
    checked={builder.posts.includeOver18 ?? false}
    label="Include NSFW results"
    onChange={(v) =>
      setField('includeOver18', v ? true : undefined)}
  />
</div>
