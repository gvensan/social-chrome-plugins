import type {
  CommentsInput,
  FeedInput,
  PostsInput,
  RedditSearchType,
  SearchInput,
  SubredditsInput,
  UsersInput,
} from '@lib/url-builder';

class BuilderStore {
  type = $state<RedditSearchType>('posts');
  posts = $state<PostsInput>({});
  comments = $state<CommentsInput>({});
  subreddits = $state<SubredditsInput>({});
  users = $state<UsersInput>({});
  feed = $state<FeedInput>({});
  /** Set by `loadSearch` when an existing saved entry is loaded for
   *  editing (Saved tab → Edit). Save then overwrites the entry in
   *  place instead of opening the Save dialog to create a new one.
   *  Cleared on type change / reset. */
  editingSavedId = $state<string | null>(null);

  current = $derived<SearchInput>(
    this.type === 'posts'
      ? { type: 'posts', input: this.posts }
      : this.type === 'comments'
        ? { type: 'comments', input: this.comments }
        : this.type === 'subreddits'
          ? { type: 'subreddits', input: this.subreddits }
          : this.type === 'users'
            ? { type: 'users', input: this.users }
            : { type: 'feed', input: this.feed }
  );

  setType(t: RedditSearchType): void {
    if (this.type !== t) {
      this.editingSavedId = null;
    }
    this.type = t;
  }

  loadSearch(s: SearchInput, opts?: { savedId?: string }): void {
    if (s.type === 'special') return;
    this.type = s.type;
    const snap = $state.snapshot(s) as SearchInput;
    if (snap.type === 'posts') this.posts = snap.input;
    else if (snap.type === 'comments') this.comments = snap.input;
    else if (snap.type === 'subreddits') this.subreddits = snap.input;
    else if (snap.type === 'users') this.users = snap.input;
    else if (snap.type === 'feed') this.feed = snap.input;
    this.editingSavedId = opts?.savedId ?? null;
  }

  /** Exit edit mode while keeping the current builder state intact.
   *  Used by the EditingBanner's exit (×) button — lets the user
   *  detach from the saved entry without losing in-progress edits. */
  exitEdit(): void {
    this.editingSavedId = null;
  }

  reset(): void {
    if (this.type === 'posts') this.posts = {};
    else if (this.type === 'comments') this.comments = {};
    else if (this.type === 'subreddits') this.subreddits = {};
    else if (this.type === 'users') this.users = {};
    else if (this.type === 'feed') this.feed = {};
    this.editingSavedId = null;
  }
}

export const builder = new BuilderStore();
