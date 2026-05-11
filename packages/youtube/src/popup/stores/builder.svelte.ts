import type { SearchInput, YouTubeSearchInput } from '@lib/url-builder';

const empty = (): YouTubeSearchInput => ({});

class BuilderStore {
  search = $state<YouTubeSearchInput>(empty());
  /** Set by `loadSearch` when an existing saved entry is loaded for
   *  editing (Saved tab → Edit). Save then overwrites the entry in
   *  place instead of opening the Save dialog to create a new one.
   *  Cleared on reset. */
  editingSavedId = $state<string | null>(null);

  current = $derived<SearchInput>({ type: 'search', input: this.search });

  update(patch: Partial<YouTubeSearchInput>): void {
    this.search = { ...this.search, ...patch };
  }

  loadSearch(s: SearchInput, opts?: { savedId?: string }): void {
    if (s.type !== 'search') return;
    const snap = $state.snapshot(s.input) as YouTubeSearchInput;
    this.search = snap;
    this.editingSavedId = opts?.savedId ?? null;
  }

  /** Exit edit mode while keeping the current builder state intact.
   *  Used by the EditingBanner's exit (×) button — lets the user
   *  detach from the saved entry without losing in-progress edits. */
  exitEdit(): void {
    this.editingSavedId = null;
  }

  reset(): void {
    this.search = empty();
    this.editingSavedId = null;
  }
}

export const builder = new BuilderStore();
