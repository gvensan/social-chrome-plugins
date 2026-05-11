<script lang="ts">
  import { companies } from '../stores/companies.svelte';
  import { router } from '@toolkit/core';

  interface Props {
    /** Identity key of the picked company (`id:<id>` or `slug:<slug>`),
     *  or null/undefined when nothing is picked. */
    companyKey: string | null | undefined;
    /** Search context — affects how strongly we warn. Jobs is the
     *  noisiest because LinkedIn's job-keyword search matches title +
     *  description + employer name (so "Microsoft" matches Azure /
     *  M365 jobs at consultancies, not just Microsoft itself). */
    context: 'jobs' | 'people' | 'posts';
  }

  let { companyKey, context }: Props = $props();

  const company = $derived(companyKey ? companies.byKey(companyKey) : null);
  const isKwOnly = $derived(!!company && !company.id);

  const contextNote = $derived(
    context === 'jobs'
      ? 'Without a numeric ID, this filters by keyword across job title, description, and employer name — common-word companies (e.g. "Microsoft") return many false positives like "Microsoft Azure Engineer at Alight."'
      : context === 'posts'
        ? 'Without a numeric ID, this matches any post that mentions the company name in text — not posts from the company\'s page.'
        : 'Without a numeric ID, this matches any profile that mentions the company name (current employees, alumni, mentions in summary or skills).'
  );
</script>

{#if isKwOnly && company}
  <p
    class="rounded border border-amber-300 bg-amber-50 p-1.5 text-[10.5px] leading-snug text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
  >
    <strong>{company.label}</strong> is saved as a keyword-only entry.
    {contextNote}
    For precise filtering, capture the numeric ID: open the company on
    LinkedIn and use
    <button
      type="button"
      class="text-brand-700 underline hover:text-brand-800 dark:text-brand-300"
      onclick={() => router.go('companies')}
    >
      Companies → "From current tab"
    </button>
    .
  </p>
{/if}
