<script lang="ts">
  import {
    EXPERIENCE_OPTIONS,
    JOBS_SORT_OPTIONS,
    JOB_TYPE_OPTIONS,
    RECENCY_OPTIONS,
    WORKPLACE_OPTIONS,
  } from '@lib/params';
  import type {
    ExperienceLevel,
    JobType,
    WorkplaceType,
  } from '@lib/url-builder';
  import { builder } from '../stores/builder.svelte';
  import { companies, companyKey } from '../stores/companies.svelte';
  import type { Company } from '../stores/companies.svelte';
  import { ChipGroup, KeywordsField, Select, Toggle } from '@toolkit/core';
  import CompanyPicker from './CompanyPicker.svelte';
  import CompanyPrecisionWarning from './CompanyPrecisionWarning.svelte';
  import JobFunctionPicker from './JobFunctionPicker.svelte';

  const toggleArr = <T,>(list: T[] | undefined, v: T): T[] | undefined => {
    const cur = list ?? [];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    return next.length ? next : undefined;
  };

  // Single-select company picker for Jobs (mirrors People). Data model
  // stays array-shaped for forward compat; UI shows the first selection.
  const jobsCompanyKey = $derived.by((): string | null => {
    const ids = builder.jobs.companyIds ?? [];
    if (ids.length > 0) {
      const c = companies.items.find((x) => x.id === ids[0]);
      if (c) return companyKey(c);
    }
    const kws = builder.jobs.companyKeywords ?? [];
    if (kws.length > 0) {
      const c = companies.items.find((x) => x.label === kws[0]);
      if (c) return companyKey(c);
    }
    return null;
  });

  const setJobsCompany = (key: string | null) => {
    const c: Company | undefined = key ? companies.byKey(key) : undefined;
    builder.jobs = {
      ...builder.jobs,
      companyIds: c?.id ? [c.id] : undefined,
      companyKeywords: c?.label ? [c.label] : undefined,
    };
  };
</script>

<div class="space-y-3">
  <KeywordsField
    value={builder.jobs.keywords}
    placeholder="e.g. product manager"
    onChange={(v) => (builder.jobs = { ...builder.jobs, keywords: v })}
  />

  <div>
    <div class="label">Location</div>
    <input
      class="input"
      placeholder="e.g. United States, San Francisco, Remote"
      value={builder.jobs.location ?? ''}
      oninput={(e) => {
        const v = (e.currentTarget as HTMLInputElement).value;
        builder.jobs = { ...builder.jobs, location: v === '' ? undefined : v };
      }}
    />
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <div class="label">Posted within</div>
      <Select
        options={RECENCY_OPTIONS}
        value={builder.jobs.recency}
        placeholder="Any time"
        onChange={(v) => (builder.jobs = { ...builder.jobs, recency: v })}
      />
    </div>
    <div>
      <div class="label">Sort</div>
      <Select
        options={JOBS_SORT_OPTIONS}
        value={builder.jobs.sort}
        placeholder="Default"
        onChange={(v) => (builder.jobs = { ...builder.jobs, sort: v })}
      />
    </div>
  </div>

  <div class="space-y-1">
    <div class="label">Company</div>
    <CompanyPicker value={jobsCompanyKey} onChange={setJobsCompany} />
    <CompanyPrecisionWarning companyKey={jobsCompanyKey} context="jobs" />
  </div>

  <div>
    <div class="label">Workplace</div>
    <ChipGroup
      options={WORKPLACE_OPTIONS}
      selected={builder.jobs.workplaceTypes ?? []}
      onToggle={(v: WorkplaceType) =>
        (builder.jobs = {
          ...builder.jobs,
          workplaceTypes: toggleArr(builder.jobs.workplaceTypes, v),
        })}
    />
  </div>

  <div>
    <div class="label">Experience level</div>
    <ChipGroup
      options={EXPERIENCE_OPTIONS}
      selected={builder.jobs.experienceLevels ?? []}
      onToggle={(v: ExperienceLevel) =>
        (builder.jobs = {
          ...builder.jobs,
          experienceLevels: toggleArr(builder.jobs.experienceLevels, v),
        })}
    />
  </div>

  <div>
    <div class="label">Job type</div>
    <ChipGroup
      options={JOB_TYPE_OPTIONS}
      selected={builder.jobs.jobTypes ?? []}
      onToggle={(v: JobType) =>
        (builder.jobs = {
          ...builder.jobs,
          jobTypes: toggleArr(builder.jobs.jobTypes, v),
        })}
    />
  </div>

  <div>
    <div class="label">Job function</div>
    <JobFunctionPicker
      value={builder.jobs.jobFunctions ?? []}
      onChange={(next) =>
        (builder.jobs = {
          ...builder.jobs,
          jobFunctions: next.length ? next : undefined,
        })}
    />
  </div>

  <div class="space-y-1.5">
    <Toggle
      checked={builder.jobs.easyApply ?? false}
      label="Easy Apply only"
      onChange={(v) => (builder.jobs = { ...builder.jobs, easyApply: v })}
    />
    <Toggle
      checked={builder.jobs.hasVerifications ?? false}
      label="Has verifications"
      onChange={(v) =>
        (builder.jobs = { ...builder.jobs, hasVerifications: v })}
    />
    <Toggle
      checked={builder.jobs.underTenApplicants ?? false}
      label="Under 10 applicants"
      onChange={(v) =>
        (builder.jobs = { ...builder.jobs, underTenApplicants: v })}
    />
    <Toggle
      checked={builder.jobs.inYourNetwork ?? false}
      label="In your network"
      onChange={(v) => (builder.jobs = { ...builder.jobs, inYourNetwork: v })}
    />
  </div>
</div>
