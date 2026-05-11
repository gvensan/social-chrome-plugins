<script lang="ts">
  import {
    people,
    personKey,
    personPageUrl,
  } from '../stores/people.svelte';
  import {
    extractPersonId,
    extractPersonToken,
    extractPersonVanity,
    cleanSlugForLabel,
  } from '@lib/company-parser';
  import {
    extractPersonIdViaFetch,
    extractPersonTokenViaFetch,
  } from '@lib/company-page-extractor';
  import { openUrl } from '../lib/open';
  import { getActiveTabUrl, Spinner } from '@toolkit/core';

  // ─── Add state ────────────────────────────────────────────────────
  let personInput = $state('');
  let personLabel = $state('');
  let personError = $state('');
  let lastAddedKind = $state<'token' | 'id' | 'vanity' | 'hybrid' | ''>('');
  let pendingDomId = $state<string | null>(null);
  let pendingToken = $state<string | null>(null);
  let captureStatus = $state('');
  let captureBusy = $state(false);
  let upgradingKey = $state<string | null>(null);

  // ─── List state ───────────────────────────────────────────────────
  let query = $state('');
  let editingKey = $state<string | null>(null);
  let editingDraft = $state('');

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people.items;
    return people.items.filter((p) => {
      if (p.label.toLowerCase().includes(q)) return true;
      if (p.token?.toLowerCase().includes(q)) return true;
      if (p.id?.includes(q)) return true;
      if (p.vanity?.toLowerCase().includes(q)) return true;
      return false;
    });
  });

  const resetCaptureState = () => {
    personInput = '';
    personLabel = '';
    pendingDomId = null;
    pendingToken = null;
    captureStatus = '';
  };

  const addPerson = async () => {
    personError = '';
    lastAddedKind = '';

    const urlToken = extractPersonToken(personInput) ?? pendingToken;
    const urlId = extractPersonId(personInput) ?? pendingDomId;
    const urlVanity = extractPersonVanity(personInput);

    // Token + vanity → preferred shape (filter-precise + readable URL).
    if (urlToken && urlVanity) {
      const key = `token:${urlToken}`;
      if (people.hasKey(key)) {
        personError = 'Already saved.';
        return;
      }
      const label = personLabel.trim() || cleanSlugForLabel(urlVanity);
      await people.add({
        token: urlToken,
        ...(urlId ? { id: urlId } : {}),
        vanity: urlVanity,
        label,
      });
      resetCaptureState();
      lastAddedKind = 'hybrid';
      return;
    }

    // Token only (e.g. raw paste of an ACoAA… token).
    if (urlToken) {
      const key = `token:${urlToken}`;
      if (people.hasKey(key)) {
        personError = 'Already saved.';
        return;
      }
      const label = personLabel.trim() || `Profile ${urlToken.slice(0, 8)}…`;
      await people.add({
        token: urlToken,
        ...(urlId ? { id: urlId } : {}),
        label,
      });
      resetCaptureState();
      lastAddedKind = 'token';
      return;
    }

    // Legacy id+vanity path — still supported for users who paste a
    // numeric URN. The `id` is no longer usable as a filter (LinkedIn
    // dropped that shape) but we keep it for display.
    if (urlId && urlVanity) {
      const key = `id:${urlId}`;
      if (people.hasKey(key)) {
        personError = 'Already saved.';
        return;
      }
      const label = personLabel.trim() || cleanSlugForLabel(urlVanity);
      await people.add({ id: urlId, vanity: urlVanity, label });
      resetCaptureState();
      lastAddedKind = 'hybrid';
      return;
    }

    if (urlId) {
      if (people.hasKey(`id:${urlId}`)) {
        personError = 'Already saved.';
        return;
      }
      const label = personLabel.trim() || `Member ${urlId}`;
      await people.add({ id: urlId, label });
      resetCaptureState();
      lastAddedKind = 'id';
      return;
    }

    if (urlVanity) {
      if (people.hasKey(`vanity:${urlVanity}`)) {
        personError = 'Already saved.';
        return;
      }
      const label = personLabel.trim() || cleanSlugForLabel(urlVanity);
      await people.add({ vanity: urlVanity, label });
      resetCaptureState();
      lastAddedKind = 'vanity';
      return;
    }

    const bare = personInput.trim();
    const labelGuess = (personLabel.trim() || bare).trim();
    if (bare && labelGuess) {
      const vanityFromBare = labelGuess.toLowerCase().replace(/\s+/g, '-');
      if (people.hasKey(`vanity:${vanityFromBare}`)) {
        personError = 'Already saved.';
        return;
      }
      await people.add({ vanity: vanityFromBare, label: labelGuess });
      resetCaptureState();
      lastAddedKind = 'vanity';
      return;
    }

    personError =
      'Type a name, or paste a LinkedIn profile URL / member URN / numeric ID.';
  };

  const onPasteEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void addPerson();
    }
  };

  const onPersonInput = (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    if (v !== personInput) {
      pendingDomId = null;
      pendingToken = null;
      captureStatus = '';
    }
    personInput = v;
  };

  // ─── Capture from active tab ─────────────────────────────────────
  // Reads the active tab's URL (only visible for linkedin.com tabs
  // because of host_permissions). If on /in/<vanity>/, kicks off the
  // tab-free fetch to grab the profile token (and legacy URN for
  // display continuity), then auto-saves.
  const captureFromTab = async () => {
    if (captureBusy) return;
    captureBusy = true;
    personError = '';
    lastAddedKind = '';
    pendingDomId = null;
    pendingToken = null;
    // Show activity within ms — the getActiveTabUrl + fetch can take
    // a few seconds combined, leaving the user wondering otherwise.
    captureStatus = 'Reading active tab …';
    try {

    const url = await getActiveTabUrl();
    if (!url) {
      personError =
        "Couldn't read the active tab URL. The toolkit only sees URLs of LinkedIn tabs — switch to a LinkedIn tab in this window and try again.";
      captureStatus = '';
      return;
    }

    // If the URL is the opaque /in/<token>/ form, save directly.
    const tokenFromUrl = extractPersonToken(url);
    if (tokenFromUrl) {
      personInput = url;
      captureStatus = `Detected profile token in the URL — saving…`;
      pendingToken = tokenFromUrl;
      await addPerson();
      return;
    }

    const idFromUrl = extractPersonId(url);
    const vanityFromUrl = extractPersonVanity(url);

    if (idFromUrl && !vanityFromUrl) {
      personInput = url;
      captureStatus = `Detected member ID ${idFromUrl} in the URL — saving…`;
      await addPerson();
      return;
    }

    if (vanityFromUrl) {
      // Tab-free fetch — primary goal is the profile token (only
      // value usable as a fromMember filter today). Also try to grab
      // the legacy member URN for display continuity, but don't fail
      // the capture if it's missing.
      captureStatus = `Fetching linkedin.com/in/${vanityFromUrl}/ …`;
      const tokenResult = await extractPersonTokenViaFetch(vanityFromUrl);
      const idResult = await extractPersonIdViaFetch(vanityFromUrl);
      personInput = url;
      if (tokenResult.ok) pendingToken = tokenResult.id;
      if (idResult.ok) pendingDomId = idResult.id;
      if (!personLabel.trim()) {
        personLabel = cleanSlugForLabel(vanityFromUrl);
      }
      if (tokenResult.ok) {
        captureStatus = `Captured profile token (via ${tokenResult.strategy}) — saving…`;
      } else {
        captureStatus = `Couldn't extract profile token (${tokenResult.reason}) — saving as keyword-only. Use "Get token" later to upgrade.`;
      }
      await addPerson();
      return;
    }

    personError =
      'No person info on the current tab. Open a LinkedIn /in/<vanity>/ profile page or a Sales Nav lead URL — then try again.';
    captureStatus = '';
    } finally {
      captureBusy = false;
    }
  };

  // ─── "Get token" upgrade path: tab-free fetch via cookies ───────
  // Promotes a vanity-only or id-only entry to token-bearing, which
  // is the only shape LinkedIn's `fromMember` filter currently honours.
  let upgradeStatus = $state<{ key: string; message: string } | null>(null);

  const upgradeToToken = async (entryKey: string, vanity: string) => {
    if (upgradingKey) return;
    upgradingKey = entryKey;
    upgradeStatus = {
      key: entryKey,
      message: `Fetching linkedin.com/in/${vanity}/ to extract profile token…`,
    };
    try {
    const result = await extractPersonTokenViaFetch(vanity);
    if (!result.ok) {
      upgradeStatus = { key: entryKey, message: result.reason };
      return;
    }
    const upgraded = await people.upgradeToToken(entryKey, result.id);
    if (!upgraded) {
      upgradeStatus = {
        key: entryKey,
        message: `Got profile token, but an entry with that token already exists. Delete one of the duplicates manually.`,
      };
      return;
    }
    upgradeStatus = {
      key: `token:${result.id}`,
      message: `Upgraded to profile token — entry now usable as a fromMember filter.`,
    };
    } finally {
      upgradingKey = null;
    }
  };

  // ─── Inline rename ───────────────────────────────────────────────
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
    if (next) await people.rename(editingKey, next);
    cancelEdit();
  };

  const focusOnMount = (node: HTMLInputElement) => {
    node.focus();
    node.select();
  };
</script>

<div class="flex h-full flex-col">
  <div class="shrink-0 space-y-3 p-3 pb-2">
    <p class="text-[11px] text-slate-500 dark:text-slate-400">
      Save individuals once, then use them as filters in Posts searches
      ("By a person"). Entries with a captured profile token get
      verified-author filtering; vanity-only entries fall back to
      keyword match. (LinkedIn's filter requires an opaque profile token
      — the legacy numeric URN was deprecated.)
    </p>

    <div class="space-y-2">
      <div class="label">Add a person</div>
      <input
        class="input"
        placeholder="Name, profile URL, profile token, or member URN…"
        value={personInput}
        oninput={onPersonInput}
        onkeydown={onPasteEnter}
      />
      <input
        class="input"
        placeholder="Friendly label (optional)"
        bind:value={personLabel}
        onkeydown={onPasteEnter}
      />
      <div class="flex gap-1.5">
        <button
          class="btn-primary flex-1"
          type="button"
          onclick={() => void addPerson()}
          disabled={!personInput.trim() && !personLabel.trim()}
        >
          Add
        </button>
        <button
          class="btn-secondary"
          type="button"
          title="Read the URL of the active LinkedIn tab and capture the person automatically"
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
          Saved with verified-author filter (token) plus keyword fallback.
        </p>
      {:else if lastAddedKind === 'token'}
        <p class="text-[11px] text-emerald-600 dark:text-emerald-400">
          Saved with verified-author precision.
        </p>
      {:else if lastAddedKind === 'id'}
        <p class="text-[11px] text-amber-600 dark:text-amber-400">
          Saved as legacy numeric ID — not usable as a filter. Add a
          profile URL or use "Get token" to enable filtering.
        </p>
      {:else if lastAddedKind === 'vanity'}
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          Saved as keyword-match. Use "Get token" later to upgrade.
        </p>
      {:else if captureStatus}
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          {captureStatus}
        </p>
      {:else if personError}
        <p class="text-[11px] text-amber-600 dark:text-amber-400">
          {personError}
        </p>
      {/if}
    </div>
  </div>

  <hr class="shrink-0 border-slate-200 dark:border-slate-700" />

  <div class="flex min-h-0 flex-1 flex-col">
    <div class="shrink-0 flex items-center justify-between px-3 pt-2">
      <div class="label !mb-0">
        Saved
        <span class="text-[10px] font-normal text-slate-400">
          {people.items.length}
        </span>
      </div>
    </div>

    {#if people.items.length === 0}
      <div class="p-3">
        <p
          class="rounded border border-dashed border-slate-300 p-3 text-center text-[11px] text-slate-500 dark:border-slate-600 dark:text-slate-400"
        >
          No people saved yet. Add one above.
        </p>
      </div>
    {:else}
      <div class="shrink-0 px-3 pt-2">
        <input
          class="input"
          placeholder="Filter by name, token, ID, or vanity…"
          bind:value={query}
        />
      </div>
      {#if filtered.length === 0}
        <p class="px-3 pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
          No matches.
        </p>
      {:else}
        <ul class="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {#each filtered as p (personKey(p))}
            {@const key = personKey(p)}
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
                        (editingDraft = (e.currentTarget as HTMLInputElement).value)}
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
                    {@const pageUrl = personPageUrl(p)}
                    {#if pageUrl}
                      <button
                        type="button"
                        class="block w-full truncate text-left text-[13px] font-medium text-slate-800 hover:text-brand-600 hover:underline dark:text-slate-100 dark:hover:text-brand-300"
                        title={`Open ${p.label} on LinkedIn`}
                        onclick={() => openUrl(pageUrl)}
                      >
                        {p.label}
                      </button>
                    {:else}
                      <span class="block w-full truncate text-[13px] font-medium">
                        {p.label}
                      </span>
                    {/if}
                  {/if}
                  <div class="mt-0.5 flex flex-wrap items-center gap-1">
                    {#if p.token}
                      <span
                        class="rounded bg-brand-100 px-1 text-[9px] font-semibold uppercase text-brand-700 dark:bg-brand-900 dark:text-brand-200"
                        title="Verified-author filter (profile token)"
                      >
                        Token
                      </span>
                      <span
                        class="text-[10px] text-slate-400"
                        title={p.token}
                      >
                        {p.token.slice(0, 10)}…
                      </span>
                    {:else if !p.vanity && p.id}
                      <span
                        class="rounded bg-amber-100 px-1 text-[9px] font-semibold uppercase text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
                        title="Legacy numeric ID — no longer usable as a filter"
                      >
                        Legacy
                      </span>
                      <span class="text-[10px] text-slate-400">{p.id}</span>
                    {:else if p.vanity}
                      <span
                        class="rounded bg-slate-200 px-1 text-[9px] font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        title="Keyword fallback"
                      >
                        KW
                      </span>
                    {/if}
                    {#if p.vanity}
                      <span class="text-[10px] text-slate-400">
                        in/{p.vanity}
                      </span>
                    {/if}
                  </div>
                </div>
                <div class="flex gap-1">
                  {#if !p.token && p.vanity}
                    <button
                      type="button"
                      class="btn-ghost text-[11px]"
                      title="Fetch this profile to capture the opaque token used by LinkedIn's fromMember filter"
                      onclick={() => void upgradeToToken(key, p.vanity!)}
                      aria-label={`Capture filter token for ${p.label}`}
                      disabled={upgradingKey === key}
                    >
                      {#if upgradingKey === key}
                        <Spinner size={10} />
                        <span class="ml-1">Fetching…</span>
                      {:else}
                        Get token
                      {/if}
                    </button>
                  {/if}
                  <button
                    type="button"
                    class="btn-ghost text-[11px]"
                    title="Rename"
                    onclick={() => startEdit(key, p.label)}
                    aria-label={`Rename ${p.label}`}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    class="btn-ghost text-[11px]"
                    title="Delete"
                    onclick={() => void people.remove(key)}
                    aria-label={`Delete ${p.label}`}
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
</div>
