import type {
  DatasetsInput,
  HFSearchType,
  ModelsInput,
  SearchInput,
  SpacesInput,
} from '@lib/url-builder';

class BuilderStore {
  type = $state<HFSearchType>('models');
  models = $state<ModelsInput>({});
  datasets = $state<DatasetsInput>({});
  spaces = $state<SpacesInput>({});
  /** Set by `loadSearch` when an existing saved entry is loaded for
   *  editing (Saved tab → Edit). Save then overwrites the entry in
   *  place instead of opening the Save dialog to create a new one.
   *  Cleared on type change / reset. */
  editingSavedId = $state<string | null>(null);

  current = $derived<SearchInput>(
    this.type === 'models'
      ? { type: 'models', input: this.models }
      : this.type === 'datasets'
        ? { type: 'datasets', input: this.datasets }
        : { type: 'spaces', input: this.spaces }
  );

  setType(t: HFSearchType): void {
    if (this.type !== t) {
      this.editingSavedId = null;
    }
    this.type = t;
  }

  loadSearch(s: SearchInput, opts?: { savedId?: string }): void {
    if (s.type === 'special') return;
    this.type = s.type;
    const snap = $state.snapshot(s) as SearchInput;
    if (snap.type === 'models') this.models = snap.input;
    else if (snap.type === 'datasets') this.datasets = snap.input;
    else if (snap.type === 'spaces') this.spaces = snap.input;
    this.editingSavedId = opts?.savedId ?? null;
  }

  /** Exit edit mode while keeping the current builder state intact.
   *  Used by the EditingBanner's exit (×) button — lets the user
   *  detach from the saved entry without losing in-progress edits. */
  exitEdit(): void {
    this.editingSavedId = null;
  }

  reset(): void {
    if (this.type === 'models') this.models = {};
    else if (this.type === 'datasets') this.datasets = {};
    else if (this.type === 'spaces') this.spaces = {};
    this.editingSavedId = null;
  }
}

export const builder = new BuilderStore();
