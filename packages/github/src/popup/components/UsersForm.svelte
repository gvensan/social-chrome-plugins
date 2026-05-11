<script lang="ts">
  import { USER_TYPE_OPTIONS } from '@lib/params';
  import { builder } from '../stores/builder.svelte';
  import { KeywordsField, Select } from '@toolkit/core';

  const setField = <K extends keyof typeof builder.users>(
    key: K,
    v: (typeof builder.users)[K]
  ) => {
    builder.users = { ...builder.users, [key]: v };
  };

  const onText = (
    key: 'location' | 'language' | 'followers' | 'repos'
  ) => (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    setField(key, v === '' ? undefined : v);
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.users.keywords}
    placeholder="e.g. fullname or username"
    onChange={(v) => setField('keywords', v)}
  />

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Location</div>
      <input
        class="input"
        placeholder="e.g. Berlin"
        value={builder.users.location ?? ''}
        oninput={onText('location')}
      />
    </div>
    <div>
      <div class="label">Language</div>
      <input
        class="input"
        placeholder="e.g. go"
        value={builder.users.language ?? ''}
        oninput={onText('language')}
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Followers</div>
      <input
        class="input"
        placeholder="e.g. >100"
        value={builder.users.followers ?? ''}
        oninput={onText('followers')}
      />
    </div>
    <div>
      <div class="label">Public repos</div>
      <input
        class="input"
        placeholder="e.g. >10"
        value={builder.users.repos ?? ''}
        oninput={onText('repos')}
      />
    </div>
  </div>

  <div>
    <div class="label">Type</div>
    <Select
      options={USER_TYPE_OPTIONS}
      value={builder.users.type}
      placeholder="Any"
      onChange={(v) => setField('type', v)}
    />
  </div>
</div>
