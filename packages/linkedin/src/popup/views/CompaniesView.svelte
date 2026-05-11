<script lang="ts">
  import {
    companies,
    companyKey,
    companyPageUrl,
  } from '../stores/companies.svelte';
  import { openUrl } from '../lib/open';
  import {
    cleanSlugForLabel,
    extractCompanyId,
    extractCompanySlug,
  } from '@lib/company-parser';
  import {
    extractCompanyIdFromTab,
    extractCompanyIdViaFetch,
  } from '@lib/company-page-extractor';
  import { getActiveTabUrl, Spinner, Tabs } from '@toolkit/core';
  import PeopleSection from '../components/PeopleSection.svelte';

  type FilterTab = 'companies' | 'people';
  const SUB_TABS: ReadonlyArray<{ id: FilterTab; label: string }> = [
    { id: 'companies', label: 'Companies' },
    { id: 'people', label: 'People' },
  ];
  let activeSubTab = $state<FilterTab>('companies');

  // ─── Add-company state ────────────────────────────────────────────
  let companyInput = $state('');
  let companyLabel = $state('');
  let companyError = $state('');
  let lastAddedKind = $state<'id' | 'slug' | 'hybrid' | ''>('');
  let pendingDomId = $state<string | null>(null);
  let captureStatus = $state('');
  let captureBusy = $state(false);
  let upgradingKey = $state<string | null>(null);

  // ─── List state ───────────────────────────────────────────────────
  let query = $state('');
  let editingKey = $state<string | null>(null);
  let editingDraft = $state('');

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies.items;
    return companies.items.filter((c) => {
      if (c.label.toLowerCase().includes(q)) return true;
      if (c.id?.includes(q)) return true;
      if (c.slug?.toLowerCase().includes(q)) return true;
      return false;
    });
  });

  // ─── Add flow ─────────────────────────────────────────────────────

  const resetCaptureState = () => {
    companyInput = '';
    companyLabel = '';
    pendingDomId = null;
    captureStatus = '';
  };

  const addCompany = async () => {
    companyError = '';
    lastAddedKind = '';

    const urlId = extractCompanyId(companyInput);
    const urlSlug = extractCompanySlug(companyInput);
    const domId = pendingDomId;

    if (domId && urlSlug) {
      const upgraded = await companies.upgradeSlugToId(urlSlug, domId);
      if (upgraded) {
        const newLabel = companyLabel.trim();
        if (newLabel && newLabel !== upgraded.label) {
          await companies.rename(`id:${domId}`, newLabel);
        }
        resetCaptureState();
        lastAddedKind = 'hybrid';
        return;
      }
      const key = `id:${domId}`;
      if (companies.hasKey(key)) {
        companyError = 'Already saved.';
        return;
      }
      const label = companyLabel.trim() || cleanSlugForLabel(urlSlug);
      await companies.add({ id: domId, slug: urlSlug, label });
      resetCaptureState();
      lastAddedKind = 'hybrid';
      return;
    }

    if (urlId) {
      if (companies.hasKey(`id:${urlId}`)) {
        companyError = 'Already saved.';
        return;
      }
      const label = companyLabel.trim() || `Company ${urlId}`;
      await companies.add({ id: urlId, label });
      resetCaptureState();
      lastAddedKind = 'id';
      return;
    }

    if (urlSlug) {
      if (companies.hasKey(`slug:${urlSlug}`)) {
        companyError = 'Already saved.';
        return;
      }
      const label = companyLabel.trim() || cleanSlugForLabel(urlSlug);
      await companies.add({ slug: urlSlug, label });
      resetCaptureState();
      lastAddedKind = 'slug';
      return;
    }

    const bare = companyInput.trim();
    const labelGuess = (companyLabel.trim() || bare).trim();
    if (bare && labelGuess) {
      const slugFromBare = labelGuess.toLowerCase().replace(/\s+/g, '-');
      if (companies.hasKey(`slug:${slugFromBare}`)) {
        companyError = 'Already saved.';
        return;
      }
      await companies.add({ slug: slugFromBare, label: labelGuess });
      resetCaptureState();
      lastAddedKind = 'slug';
      return;
    }

    companyError =
      'Type a company name, or paste a LinkedIn URL / URN / numeric ID.';
  };

  const onPasteEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void addCompany();
    }
  };

  const onCompanyInput = (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    if (v !== companyInput) {
      pendingDomId = null;
      captureStatus = '';
    }
    companyInput = v;
  };

  const captureFromTab = async () => {
    if (captureBusy) return;
    captureBusy = true;
    companyError = '';
    lastAddedKind = '';
    pendingDomId = null;
    // Show activity within ms — the fetch chain can take a few seconds.
    captureStatus = 'Reading active tab …';
    try {
    const url = await getActiveTabUrl();
    if (!url) {
      companyError =
        "Couldn't read the active tab URL. The toolkit only sees URLs of LinkedIn tabs — switch to a LinkedIn tab in this window and try again.";
      captureStatus = '';
      return;
    }

    const idFromUrl = extractCompanyId(url);
    const slugFromUrl = extractCompanySlug(url);

    if (idFromUrl) {
      companyInput = url;
      captureStatus = `Detected ID ${idFromUrl} in the URL — saving…`;
      // Auto-add: skip the manual "Add company" click. The capture
      // status will be replaced by the lastAddedKind status from
      // addCompany, which is more informative.
      await addCompany();
      return;
    }

    if (slugFromUrl) {
      // Pass the slug explicitly so the fetch fallback can run even if
      // the user is on a different LinkedIn tab. With three strategies
      // (DOM scan → MutationObserver wait → in-page fetch), this
      // succeeds for any signed-in user on any LinkedIn tab.
      captureStatus = `Extracting ID for "${slugFromUrl}" …`;
      const result = await extractCompanyIdFromTab({ fetchSlug: slugFromUrl });
      companyInput = url;
      if (result.ok) {
        pendingDomId = result.id;
      }
      if (!companyLabel.trim()) {
        companyLabel = cleanSlugForLabel(slugFromUrl);
      }
      // Always auto-save when we recognize the company URL — whether or
      // not URN extraction succeeded. Hybrid (id+slug) on success;
      // keyword-only fallback otherwise. The user gets a single-click
      // capture either way; they can click "Get ID" later to upgrade
      // a KW-only entry once the URN becomes available (LinkedIn tab,
      // signed in).
      if (result.ok) {
        captureStatus = `Captured ID ${result.id} (via ${result.strategy}) — saving…`;
      } else {
        captureStatus = `Couldn't extract URN (${result.reason}) — saving as keyword-only. Use "Get ID" later to upgrade.`;
      }
      await addCompany();
      return;
    }

    companyError =
      'No company info on the current tab. Open a LinkedIn company page, search with a company filter, or Sales Nav — then try again.';
    captureStatus = '';
    } finally {
      captureBusy = false;
    }
  };

  // ─── Inline rename ────────────────────────────────────────────────

  const startEdit = (key: string, current: string) => {
    editingKey = key;
    editingDraft = current;
  };

  const cancelEdit = () => {
    editingKey = null;
    editingDraft = '';
  };

  const commitEdit = async () => {
    if (!editingKey) return;
    const next = editingDraft.trim();
    if (next) await companies.rename(editingKey, next);
    cancelEdit();
  };

  const focusOnMount = (node: HTMLInputElement) => {
    node.focus();
    node.select();
  };

  // ─── Upgrade KW-only → ID via direct fetch ───────────────────────
  // Per-row "Get ID" button: fetches `linkedin.com/company/<slug>/`
  // directly from the extension context using the user's session
  // cookies. No tab requirement — user just needs to be signed in
  // somewhere in this Chrome profile.
  let upgradeStatus = $state<{ key: string; message: string } | null>(null);

  const upgradeFromCurrentTab = async (entryKey: string, slug: string) => {
    if (upgradingKey) return;
    upgradingKey = entryKey;
    upgradeStatus = {
      key: entryKey,
      message: `Fetching linkedin.com/company/${slug}/ to extract URN…`,
    };
    try {
    const result = await extractCompanyIdViaFetch(slug);
    if (!result.ok) {
      upgradeStatus = { key: entryKey, message: result.reason };
      return;
    }
    const upgraded = await companies.upgradeSlugToId(slug, result.id);
    if (!upgraded) {
      upgradeStatus = {
        key: entryKey,
        message: `Got ID ${result.id}, but an entry with that ID already exists. Delete one of the duplicates manually.`,
      };
      return;
    }
    upgradeStatus = {
      key: `id:${result.id}`,
      message: `Upgraded to ID ${result.id} — entry now uses verified-employment filtering.`,
    };
    } finally {
      upgradingKey = null;
    }
  };
</script>

<div class="flex h-full flex-col">
  <div class="shrink-0 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
    <Tabs
      items={SUB_TABS}
      active={activeSubTab}
      onChange={(id: FilterTab) => (activeSubTab = id)}
    />
  </div>

  {#if activeSubTab === 'people'}
    <PeopleSection />
  {:else}
  <!-- Fixed top: description + add-company section -->
  <div class="shrink-0 space-y-3 p-3 pb-2">
    <p class="text-[11px] text-slate-500 dark:text-slate-400">
      Save LinkedIn companies once, then use them as filters in People
      searches. Entries with a numeric ID get verified-employment filtering
      plus keyword fallback for free recall; name- or slug-only entries
      use keyword fallback alone.
    </p>

    <div class="space-y-2">
      <div class="label">Add a company</div>
      <input
        class="input"
        placeholder="Company name or LinkedIn URL / ID…"
        value={companyInput}
        oninput={onCompanyInput}
        onkeydown={onPasteEnter}
      />
      <input
        class="input"
        placeholder="Friendly label (optional)"
        bind:value={companyLabel}
        onkeydown={onPasteEnter}
      />
      <div class="flex gap-1.5">
        <button
          class="btn-primary flex-1"
          type="button"
          onclick={() => void addCompany()}
          disabled={!companyInput.trim() && !companyLabel.trim()}
        >
          Add
        </button>
        <button
          class="btn-secondary"
          type="button"
          title="Read the URL of the active LinkedIn tab and prefill the input"
          onclick={() => void captureFromTab()}
          disabled={captureBusy}
        >
          {#if captureBusy}
            <Spinner />
            <span class="ml-1.5">Capturing…</span>
          {:else}
            From current tab
          {/if}
        </button>
      </div>
      {#if lastAddedKind === 'hybrid'}
        <p class="text-[11px] text-emerald-600 dark:text-emerald-400">
          Saved with both verified-employment ID and keyword fallback.
        </p>
      {:else if lastAddedKind === 'id'}
        <p class="text-[11px] text-emerald-600 dark:text-emerald-400">
          Saved with verified-employment precision.
        </p>
      {:else if lastAddedKind === 'slug'}
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          Saved as keyword-match. For verified-employment precision,
          click "From current tab" while on a LinkedIn company page.
        </p>
      {:else if captureStatus}
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          {captureStatus}
        </p>
      {:else if companyError}
        <p class="text-[11px] text-amber-600 dark:text-amber-400">
          {companyError}
        </p>
      {/if}
    </div>
  </div>

  <hr class="shrink-0 border-slate-200 dark:border-slate-700" />

  <!-- Bounded scroll region: saved list with its own scroll -->
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="shrink-0 flex items-center justify-between px-3 pt-2">
      <div class="label !mb-0">
        Saved
        <span class="text-[10px] font-normal text-slate-400">
          {companies.items.length}
        </span>
      </div>
    </div>

    {#if companies.items.length === 0}
      <div class="p-3">
        <p
          class="rounded border border-dashed border-slate-300 p-3 text-center text-[11px] text-slate-500 dark:border-slate-600 dark:text-slate-400"
        >
          No companies saved yet. Add one above.
        </p>
      </div>
    {:else}
      <div class="shrink-0 px-3 pt-2">
        <input
          class="input"
          placeholder="Filter by name, ID, or slug…"
          bind:value={query}
        />
      </div>
      {#if filtered.length === 0}
        <p
          class="px-3 pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400"
        >
          No matches.
        </p>
      {:else}
        <ul class="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {#each filtered as c (companyKey(c))}
            {@const key = companyKey(c)}
            <li
              class="rounded border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800"
            >
              <div class="flex items-start gap-2">
                <div class="min-w-0 flex-1">
                  {#if editingKey === key}
                    <input
                      class="input !py-0.5 !text-[12px]"
                      value={editingDraft}
                      use:focusOnMount
                      oninput={(e) =>
                        (editingDraft = (e.currentTarget as HTMLInputElement)
                          .value)}
                      onblur={() => void commitEdit()}
                      onkeydown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void commitEdit();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                    />
                  {:else}
                    {@const pageUrl = companyPageUrl(c)}
                    {#if pageUrl}
                      <button
                        type="button"
                        class="block w-full truncate text-left text-[13px] font-medium text-slate-800 hover:text-brand-600 hover:underline dark:text-slate-100 dark:hover:text-brand-300"
                        title={`Open ${c.label} on LinkedIn`}
                        onclick={() => openUrl(pageUrl)}
                      >
                        {c.label}
                      </button>
                    {:else}
                      <span
                        class="block w-full truncate text-[13px] font-medium"
                      >
                        {c.label}
                      </span>
                    {/if}
                  {/if}
                  <div class="mt-0.5 flex flex-wrap items-center gap-1">
                    {#if c.id}
                      <span
                        class="rounded bg-brand-100 px-1 text-[9px] font-semibold uppercase text-brand-700 dark:bg-brand-900 dark:text-brand-200"
                        title="Verified-employment precision"
                      >
                        ID
                      </span>
                      <span class="text-[10px] text-slate-400">{c.id}</span>
                    {/if}
                    {#if c.slug}
                      {#if !c.id}
                        <span
                          class="rounded bg-slate-200 px-1 text-[9px] font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          title="Keyword fallback — less precise than ID-based"
                        >
                          KW
                        </span>
                      {/if}
                      <span class="text-[10px] text-slate-400">
                        slug: {c.slug}
                      </span>
                    {/if}
                  </div>
                </div>
                <div class="flex gap-1">
                  {#if !c.id && c.slug}
                    <button
                      type="button"
                      class="btn-ghost text-[11px]"
                      title="Open this company's LinkedIn page in the active tab, then click here to capture its numeric ID via DOM extraction"
                      onclick={() => void upgradeFromCurrentTab(key, c.slug!)}
                      aria-label={`Capture numeric ID for ${c.label}`}
                      disabled={upgradingKey === key}
                    >
                      {#if upgradingKey === key}
                        <Spinner size={10} />
                        <span class="ml-1">Fetching…</span>
                      {:else}
                        Get ID
                      {/if}
                    </button>
                  {/if}
                  <button
                    type="button"
                    class="btn-ghost text-[11px]"
                    title="Rename"
                    onclick={() => startEdit(key, c.label)}
                    aria-label={`Rename ${c.label}`}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    class="btn-ghost text-[11px]"
                    title="Delete"
                    onclick={() => void companies.remove(key)}
                    aria-label={`Delete ${c.label}`}
                  >
                    ×
                  </button>
                </div>
              </div>
              {#if upgradeStatus && upgradeStatus.key === key}
                <p
                  class="mt-1 rounded border border-amber-300 bg-amber-50 p-1.5 text-[10.5px] leading-snug text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                >
                  {upgradeStatus.message}
                </p>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </div>
  {/if}
</div>
