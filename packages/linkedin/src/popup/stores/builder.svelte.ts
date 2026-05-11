import type {
  JobsInput,
  PeopleInput,
  PostsInput,
  SearchInput,
  SearchType,
} from '@lib/url-builder';
import type { TemplateFocus } from '@lib/templates';
import { settings } from './settings.svelte';

/**
 * Resolve `postedBy: ['me', ...]` into a `fromMember` filter using the
 * captured `selfToken`. The URL builder stays pure (no settings
 * dependency); the expansion happens here so saved searches store the
 * raw `'me'` token and auto-pick up the new self-token if the user
 * changes their LinkedIn profile later.
 *
 * Why expand at all: LinkedIn's URL contract doesn't honour
 * `postedBy=["me"]` (it's a UI-only client-side facet). The only shape
 * that filters posts to a single person is `fromMember=["<token>"]`,
 * so "Me" only works if we have the user's own profile token.
 *
 * If `'me'` is in postedBy but no selfToken is set, `'me'` is silently
 * dropped — better than emitting a filter LinkedIn ignores (zero
 * results). The chip itself is gated on selfToken in PostsForm so this
 * branch only fires for stale saved searches.
 */
const resolvePostsForBuild = (input: PostsInput): PostsInput => {
  const pb = input.postedBy ?? [];
  if (!pb.includes('me')) return input;
  const selfToken = settings.value.selfToken;
  // "Me" is mutually exclusive with the network-bucket postedBy chips
  // (LinkedIn doesn't honour fromMember + postedBy=first/following in
  // the same query). The PostsForm toggle enforces this in the UI;
  // here we also drop any siblings defensively in case a legacy saved
  // search persisted them together.
  const next: PostsInput = { ...input, postedBy: undefined };
  if (selfToken) {
    const existing = input.fromMemberTokens ?? [];
    next.fromMemberTokens = existing.includes(selfToken)
      ? existing
      : [selfToken, ...existing];
  }
  return next;
};

export interface BuilderContext {
  /** Template title — shown at the top of the Builder so users see
   *  which template they're customizing. */
  title: string;
  /** Picker focus — hides irrelevant picker sections in the form. */
  focus?: TemplateFocus;
}

class BuilderStore {
  type = $state<SearchType>('posts');
  posts = $state<PostsInput>({});
  jobs = $state<JobsInput>({});
  people = $state<PeopleInput>({});
  /** Set by `loadSearch` when a template is loaded via Customize.
   *  Cleared when the user manually changes type, resets, or clears
   *  the context explicitly. */
  context = $state<BuilderContext | null>(null);
  /** Set by `loadSearch` when an existing saved entry is loaded for
   *  editing (Saved tab → Edit). Save then overwrites the entry in
   *  place instead of opening the Save dialog to create a new one.
   *  Cleared on type change / reset / explicit context clear. */
  editingSavedId = $state<string | null>(null);

  current = $derived<SearchInput>(
    this.type === 'posts'
      ? { type: 'posts', input: resolvePostsForBuild(this.posts) }
      : this.type === 'jobs'
        ? { type: 'jobs', input: this.jobs }
        : { type: 'people', input: this.people }
  );

  setType(t: SearchType): void {
    if (this.type !== t) {
      this.context = null;
      this.editingSavedId = null;
    }
    this.type = t;
  }

  loadSearch(
    s: SearchInput,
    opts?: BuilderContext & { savedId?: string }
  ): void {
    this.type = s.type;
    const snap = $state.snapshot(s) as SearchInput;
    if (snap.type === 'posts') this.posts = snap.input;
    else if (snap.type === 'jobs') this.jobs = snap.input;
    else this.people = snap.input;
    this.context = opts ? { title: opts.title, focus: opts.focus } : null;
    this.editingSavedId = opts?.savedId ?? null;
  }

  reset(): void {
    if (this.type === 'posts') this.posts = {};
    else if (this.type === 'jobs') this.jobs = {};
    else this.people = {};
    this.context = null;
    this.editingSavedId = null;
  }

  clearContext(): void {
    this.context = null;
    this.editingSavedId = null;
  }

  /** Exit edit mode while keeping the current builder state intact.
   *  Used by the EditingBanner's exit (×) button — lets the user
   *  detach from the saved entry without losing in-progress edits.
   *  Distinct from `clearContext` (which also clears the template
   *  customization banner) and `reset` (which empties the form). */
  exitEdit(): void {
    this.editingSavedId = null;
  }
}

export const builder = new BuilderStore();
