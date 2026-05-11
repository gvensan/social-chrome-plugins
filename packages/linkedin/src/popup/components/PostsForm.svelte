<script lang="ts">
  import {
    CONTENT_DATE_OPTIONS,
    CONTENT_SORT_OPTIONS,
    CONTENT_TYPE_OPTIONS,
    POSTED_BY_OPTIONS,
  } from '@lib/params';
  import type { PostedBy, PostsInput } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';
  import { companies, companyKey } from '../stores/companies.svelte';
  import type { Company } from '../stores/companies.svelte';
  import { people, personKey } from '../stores/people.svelte';
  import type { Person } from '../stores/people.svelte';
  import { settings } from '../stores/settings.svelte';
  import { ChipGroup, KeywordsField, Select } from '@toolkit/core';
  import CompanyPicker from './CompanyPicker.svelte';
  import CompanyPrecisionWarning from './CompanyPrecisionWarning.svelte';
  import PersonPicker from './PersonPicker.svelte';

  const get = (): PostsInput => builder.posts;

  const togglePostedBy = (v: PostedBy) => {
    const list = get().postedBy ?? [];
    const isOn = list.includes(v);
    let next: PostedBy[];
    if (isOn) {
      next = list.filter((x) => x !== v);
      builder.posts = { ...get(), postedBy: next.length ? next : undefined };
      return;
    }
    if (v === 'me') {
      // "Me" is mutually exclusive with the network-bucket chips —
      // LinkedIn doesn't honour them together (Me expands to a
      // fromMember filter, which can't be intersected with postedBy
      // network buckets in the same query).
      next = ['me'];
    } else {
      next = [...list.filter((x) => x !== 'me'), v];
    }
    // Adding any postedBy value clears the entity-picker filters
    // (person / from-company / mentions-company). LinkedIn doesn't
    // intersect a network-bucket postedBy with a specific-author or
    // specific-mention filter — both modes return zero together. The
    // entity pickers' setters do the symmetric clear.
    builder.posts = {
      ...get(),
      postedBy: next,
      fromOrganizationIds: undefined,
      fromMemberTokens: undefined,
      mentionsCompanyIds: undefined,
      mentionsMemberTokens: undefined,
      companyKeywords: undefined,
      personKeywords: undefined,
    };
  };

  // Hide the "Me" chip until the user has captured their own profile
  // token in Settings. Without it, "Me" expands to nothing at build
  // time (LinkedIn ignores `postedBy=["me"]` via URL), so the chip
  // would be misleading.
  const postedByOptions = $derived(
    settings.value.selfToken
      ? POSTED_BY_OPTIONS
      : POSTED_BY_OPTIONS.filter((o) => o.value !== 'me')
  );

  // Single-select company picker for posts-from-organization. Same data
  // model shape (string[]) as Jobs/People for forward compatibility.
  const postsCompanyKey = $derived.by((): string | null => {
    const ids = builder.posts.fromOrganizationIds ?? [];
    if (ids.length > 0) {
      const c = companies.items.find((x) => x.id === ids[0]);
      if (c) return companyKey(c);
    }
    const kws = builder.posts.companyKeywords ?? [];
    if (kws.length > 0) {
      const c = companies.items.find((x) => x.label === kws[0]);
      if (c) return companyKey(c);
    }
    return null;
  });

  const setPostsCompany = (key: string | null) => {
    const c: Company | undefined = key ? companies.byKey(key) : undefined;
    builder.posts = {
      ...builder.posts,
      fromOrganizationIds: c?.id ? [c.id] : undefined,
      // Keyword fallback only when no ID — otherwise the keyword
      // becomes an AND filter that narrows results to posts that
      // literally mention the company name (often zero hits).
      companyKeywords: c && !c.id && c.label ? [c.label] : undefined,
      // Picking an entity filter clears the network-bucket postedBy
      // chips (mutually exclusive — see togglePostedBy comment).
      ...(c ? { postedBy: undefined } : {}),
    };
  };

  // Mentions-a-company picker — separate from the From-a-company-page
  // picker (different URL params, different intent). Reuses the same
  // CompanyPicker UI and the shared companyKeywords fallback.
  const postsMentionsCompanyKey = $derived.by((): string | null => {
    const ids = builder.posts.mentionsCompanyIds ?? [];
    if (ids.length > 0) {
      const c = companies.items.find((x) => x.id === ids[0]);
      if (c) return companyKey(c);
    }
    return null;
  });

  const setPostsMentionsCompany = (key: string | null) => {
    const c: Company | undefined = key ? companies.byKey(key) : undefined;
    builder.posts = {
      ...builder.posts,
      mentionsCompanyIds: c?.id ? [c.id] : undefined,
      ...(c ? { postedBy: undefined } : {}),
    };
  };

  // Single-select person picker (mirrors company picker). Maps to
  // fromMemberTokens for token-backed people, personKeywords for
  // vanity-only fallback. The legacy numeric-id path is no longer
  // wired into the URL: LinkedIn only honours profile tokens in the
  // `fromMember` filter today.
  const postsPersonKey = $derived.by((): string | null => {
    const tokens = builder.posts.fromMemberTokens ?? [];
    if (tokens.length > 0) {
      const p = people.items.find((x) => x.token === tokens[0]);
      if (p) return personKey(p);
    }
    const kws = builder.posts.personKeywords ?? [];
    if (kws.length > 0) {
      const p = people.items.find((x) => x.label === kws[0]);
      if (p) return personKey(p);
    }
    return null;
  });

  const setPostsPerson = (key: string | null) => {
    const p: Person | undefined = key ? people.byKey(key) : undefined;
    builder.posts = {
      ...builder.posts,
      fromMemberTokens: p?.token ? [p.token] : undefined,
      // Keyword fallback only when no token — keyword AND filter on
      // the person's name kills results (author posts rarely contain
      // their own name verbatim) but is the only signal we have when
      // the token isn't captured.
      personKeywords: p && !p.token && p.label ? [p.label] : undefined,
      ...(p ? { postedBy: undefined } : {}),
    };
  };

  // Mentions-a-person picker — analogous to mentions-a-company. Token
  // is required (no keyword fallback — author names rarely appear as
  // exact text in posts that mention them).
  const postsMentionsPersonKey = $derived.by((): string | null => {
    const tokens = builder.posts.mentionsMemberTokens ?? [];
    if (tokens.length === 0) return null;
    const p = people.items.find((x) => x.token === tokens[0]);
    return p ? personKey(p) : null;
  });

  const setPostsMentionsPerson = (key: string | null) => {
    const p: Person | undefined = key ? people.byKey(key) : undefined;
    builder.posts = {
      ...builder.posts,
      mentionsMemberTokens: p?.token ? [p.token] : undefined,
      ...(p ? { postedBy: undefined } : {}),
    };
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.posts.keywords}
    onChange={(v) => (builder.posts = { ...builder.posts, keywords: v })}
  />

  <div>
    <div class="label">Sort</div>
    <Select
      options={CONTENT_SORT_OPTIONS}
      value={builder.posts.sort}
      placeholder="— Default —"
      onChange={(v) => (builder.posts = { ...builder.posts, sort: v })}
    />
  </div>

  <div>
    <div class="label">Date posted</div>
    <Select
      options={CONTENT_DATE_OPTIONS}
      value={builder.posts.datePosted}
      placeholder="Any time"
      onChange={(v) => (builder.posts = { ...builder.posts, datePosted: v })}
    />
  </div>

  <div>
    <div class="label">Content type</div>
    <Select
      options={CONTENT_TYPE_OPTIONS}
      value={builder.posts.contentType}
      placeholder="Any type"
      onChange={(v) =>
        (builder.posts = { ...builder.posts, contentType: v })}
    />
    <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
      Uses <code>contentType=["videos|photos|documents"]</code> — the
      exact param shape LinkedIn's UI sends when the filter is applied
      via the dropdown.
    </p>
  </div>

  <div>
    <div class="label">Posted by</div>
    <ChipGroup
      options={postedByOptions}
      selected={builder.posts.postedBy ?? []}
      onToggle={togglePostedBy}
    />
    <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
      Experimental — LinkedIn may rename this parameter without notice.
    </p>
  </div>

  {#if builder.context?.focus !== 'person'}
    <div class="space-y-1">
      <div class="label">From a company</div>
      <CompanyPicker value={postsCompanyKey} onChange={setPostsCompany} />
      <CompanyPrecisionWarning companyKey={postsCompanyKey} context="posts" />
      <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
        Posts published from the company's own LinkedIn page (uses
        <code>fromOrganization</code>). ID-backed company gives the
        strict org filter plus a keyword fallback for free recall.
      </p>
    </div>
  {/if}

  {#if builder.context?.focus !== 'company'}
    <div class="space-y-1">
      <div class="label">From a person</div>
      <PersonPicker value={postsPersonKey} onChange={setPostsPerson} />
      <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
        Posts authored by a specific person (uses <code>fromMember</code>
        with the profile token). Save people in the Filters tab via
        "From current tab" while on their profile.
      </p>
    </div>
  {/if}

  {#if builder.context?.focus !== 'person'}
    <div class="space-y-1">
      <div class="label">Mentions a company</div>
      <CompanyPicker
        value={postsMentionsCompanyKey}
        onChange={setPostsMentionsCompany}
        requireId
      />
      <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
        Posts that @-mention the company entity (uses
        <code>mentionsOrganization</code>). Only ID-backed companies are
        listed — slug-only entries can't drive this filter.
      </p>
    </div>
  {/if}

  {#if builder.context?.focus !== 'company'}
    <div class="space-y-1">
      <div class="label">Mentions a person</div>
      <PersonPicker
        value={postsMentionsPersonKey}
        onChange={setPostsMentionsPerson}
        requireToken
      />
      <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
        Posts that @-mention a specific person (uses
        <code>mentionsMember</code> with the profile token). Only
        token-bearing people are listed.
      </p>
    </div>
  {/if}
</div>
