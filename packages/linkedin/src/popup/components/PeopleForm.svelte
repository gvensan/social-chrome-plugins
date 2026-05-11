<script lang="ts">
  import { NETWORK_OPTIONS } from '@lib/params';
  import type { NetworkDegree } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';
  import { companies, companyKey } from '../stores/companies.svelte';
  import type { Company } from '../stores/companies.svelte';
  import { ChipGroup, KeywordsField } from '@toolkit/core';
  import CompanyPicker from './CompanyPicker.svelte';
  import CompanyPrecisionWarning from './CompanyPrecisionWarning.svelte';
  import IndustryPicker from './IndustryPicker.svelte';

  const toggleNetwork = (v: NetworkDegree) => {
    const cur = builder.people.network ?? [];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    builder.people = {
      ...builder.people,
      network: next.length ? next : undefined,
    };
  };

  // ─── Derive picker values from current builder state ──────────────
  // The data model holds arrays (string[]) for forward-compatibility with
  // multi-company searches, but the UI is single-select per bucket: we
  // show the first selected ID-or-keyword as the picker's value.
  const pickerKeyFor = (
    bucket: 'current' | 'past'
  ): string | null => {
    const idsKey =
      bucket === 'current' ? 'currentCompanyIds' : 'pastCompanyIds';
    const kwKey =
      bucket === 'current'
        ? 'currentCompanyKeywords'
        : 'pastCompanyKeywords';
    const ids = builder.people[idsKey] ?? [];
    if (ids.length > 0) {
      // Find the saved company whose id matches.
      const c = companies.items.find((x) => x.id === ids[0]);
      if (c) return companyKey(c);
    }
    const kws = builder.people[kwKey] ?? [];
    if (kws.length > 0) {
      const c = companies.items.find((x) => x.label === kws[0]);
      if (c) return companyKey(c);
    }
    return null;
  };

  const currentKey = $derived(pickerKeyFor('current'));
  const pastKey = $derived(pickerKeyFor('past'));

  const setCompany = (
    bucket: 'current' | 'past',
    key: string | null
  ) => {
    const idsKey =
      bucket === 'current' ? 'currentCompanyIds' : 'pastCompanyIds';
    const kwKey =
      bucket === 'current'
        ? 'currentCompanyKeywords'
        : 'pastCompanyKeywords';
    const c: Company | undefined = key ? companies.byKey(key) : undefined;
    builder.people = {
      ...builder.people,
      [idsKey]: c?.id ? [c.id] : undefined,
      [kwKey]: c?.label ? [c.label] : undefined,
    };
  };

  // ─── Industry (enum) ────────────────────────────────────────────
  const setIndustry = (id: string | undefined) => {
    builder.people = {
      ...builder.people,
      industryIds: id ? [id] : undefined,
    };
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.people.keywords}
    placeholder="e.g. product manager"
    onChange={(v) => (builder.people = { ...builder.people, keywords: v })}
  />

  <div>
    <div class="label">Network degree</div>
    <ChipGroup
      options={NETWORK_OPTIONS}
      selected={builder.people.network ?? []}
      onToggle={toggleNetwork}
    />
  </div>

  <div>
    <div class="label">Title contains</div>
    <input
      class="input"
      placeholder="e.g. Director, Engineering"
      value={builder.people.titleFreeText ?? ''}
      oninput={(e) => {
        const v = (e.currentTarget as HTMLInputElement).value;
        builder.people = {
          ...builder.people,
          titleFreeText: v === '' ? undefined : v,
        };
      }}
    />
  </div>

  <div class="space-y-1">
    <div class="label">Currently at</div>
    <CompanyPicker
      value={currentKey}
      onChange={(k) => setCompany('current', k)}
    />
    <CompanyPrecisionWarning companyKey={currentKey} context="people" />
  </div>

  <div class="space-y-1">
    <div class="label">Previously at</div>
    <CompanyPicker
      value={pastKey}
      onChange={(k) => setCompany('past', k)}
    />
    <CompanyPrecisionWarning companyKey={pastKey} context="people" />
  </div>

  <div>
    <div class="label">Industry</div>
    <IndustryPicker
      value={builder.people.industryIds?.[0]}
      onChange={setIndustry}
    />
    <p class="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
      Beta — uses LinkedIn's <code>industryCompany</code> URL parameter.
      Filters people by their current employer's industry.
    </p>
  </div>

</div>
