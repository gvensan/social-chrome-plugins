import type {
  CodeInput,
  GitHubSearchType,
  IssuesInput,
  PullRequestsInput,
  RepositoriesInput,
  SearchInput,
  UsersInput,
} from '@lib/url-builder';

class BuilderStore {
  type = $state<GitHubSearchType>('repositories');
  repositories = $state<RepositoriesInput>({});
  code = $state<CodeInput>({});
  issues = $state<IssuesInput>({});
  pullrequests = $state<PullRequestsInput>({});
  users = $state<UsersInput>({});
  /** Set by `loadSearch` when an existing saved entry is loaded for
   *  editing (Saved tab → Edit). Save then overwrites the entry in
   *  place instead of opening the Save dialog to create a new one.
   *  Cleared on type change / reset. */
  editingSavedId = $state<string | null>(null);

  current = $derived<SearchInput>(
    this.type === 'repositories'
      ? { type: 'repositories', input: this.repositories }
      : this.type === 'code'
        ? { type: 'code', input: this.code }
        : this.type === 'issues'
          ? { type: 'issues', input: this.issues }
          : this.type === 'pullrequests'
            ? { type: 'pullrequests', input: this.pullrequests }
            : { type: 'users', input: this.users }
  );

  setType(t: GitHubSearchType): void {
    if (this.type !== t) {
      this.editingSavedId = null;
    }
    this.type = t;
  }

  loadSearch(s: SearchInput, opts?: { savedId?: string }): void {
    if (s.type === 'special') return;
    this.type = s.type;
    const snap = $state.snapshot(s) as SearchInput;
    if (snap.type === 'repositories') this.repositories = snap.input;
    else if (snap.type === 'code') this.code = snap.input;
    else if (snap.type === 'issues') this.issues = snap.input;
    else if (snap.type === 'pullrequests') this.pullrequests = snap.input;
    else if (snap.type === 'users') this.users = snap.input;
    this.editingSavedId = opts?.savedId ?? null;
  }

  /** Exit edit mode while keeping the current builder state intact.
   *  Used by the EditingBanner's exit (×) button — lets the user
   *  detach from the saved entry without losing in-progress edits. */
  exitEdit(): void {
    this.editingSavedId = null;
  }

  reset(): void {
    if (this.type === 'repositories') this.repositories = {};
    else if (this.type === 'code') this.code = {};
    else if (this.type === 'issues') this.issues = {};
    else if (this.type === 'pullrequests') this.pullrequests = {};
    else if (this.type === 'users') this.users = {};
    this.editingSavedId = null;
  }
}

export const builder = new BuilderStore();
