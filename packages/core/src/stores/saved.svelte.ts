import { loadKey, saveKey } from '../storage';

/**
 * Generic saved-search record. The `search` field is whatever
 * SearchInput shape the host plugin uses — the store treats it as
 * opaque JSON and never reaches into it.
 */
export interface SavedSearchBase<T> {
  id: string;
  name: string;
  tags: string[];
  search: T;
  url: string;
  createdAt: number;
  lastOpenedAt?: number;
}

const newId = (): string =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Plugin-agnostic saved-searches store. Each plugin instantiates one:
 *
 *   export const savedSearches = new SavedSearchesStore<SearchInput>();
 *
 * Storage key defaults to `savedSearches`; override via constructor if
 * a plugin needs a different namespace within `chrome.storage.local`.
 */
export class SavedSearchesStore<T> {
  items = $state<SavedSearchBase<T>[]>([]);
  loaded = $state(false);

  constructor(private storageKey: string = 'savedSearches') {}

  async load(): Promise<void> {
    this.items = await loadKey<SavedSearchBase<T>[]>(this.storageKey, []);
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    await saveKey(this.storageKey, $state.snapshot(this.items));
  }

  /** Find an existing saved search whose URL matches exactly. Used by
   *  the Save dialog to warn before creating duplicates. */
  findByUrl(url: string): SavedSearchBase<T> | undefined {
    return this.items.find((it) => it.url === url);
  }

  byId(id: string): SavedSearchBase<T> | undefined {
    return this.items.find((it) => it.id === id);
  }

  async create(input: {
    name: string;
    tags: string[];
    search: T;
    url: string;
  }): Promise<SavedSearchBase<T>> {
    const record: SavedSearchBase<T> = {
      id: newId(),
      name: input.name.trim() || 'Untitled search',
      tags: input.tags,
      search: $state.snapshot(input.search) as T,
      url: input.url,
      createdAt: Date.now(),
    };
    this.items = [record, ...this.items];
    await this.persist();
    return record;
  }

  async update(
    id: string,
    patch: Partial<SavedSearchBase<T>>
  ): Promise<void> {
    this.items = this.items.map((it) =>
      it.id === id ? { ...it, ...patch } : it
    );
    await this.persist();
  }

  /** Overwrite the existing entry's search/url/tags in place. Used by
   *  the "Save" action when the builder is editing a previously-saved
   *  entry — preserves id/name/createdAt while replacing the contents. */
  async overwrite(
    id: string,
    next: { search: T; url: string; tags?: string[] }
  ): Promise<SavedSearchBase<T> | undefined> {
    const existing = this.byId(id);
    if (!existing) return undefined;
    const updated: SavedSearchBase<T> = {
      ...existing,
      search: $state.snapshot(next.search) as T,
      url: next.url,
      tags: next.tags ?? existing.tags,
    };
    this.items = this.items.map((it) => (it.id === id ? updated : it));
    await this.persist();
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.items = this.items.filter((it) => it.id !== id);
    await this.persist();
  }

  async duplicate(id: string): Promise<void> {
    const source = this.byId(id);
    if (!source) return;
    const copy: SavedSearchBase<T> = {
      ...($state.snapshot(source) as SavedSearchBase<T>),
      id: newId(),
      name: `${source.name} (copy)`,
      createdAt: Date.now(),
      lastOpenedAt: undefined,
    };
    this.items = [copy, ...this.items];
    await this.persist();
  }

  async markOpened(id: string): Promise<void> {
    await this.update(id, { lastOpenedAt: Date.now() });
  }

  allTags(): string[] {
    const set = new Set<string>();
    for (const it of this.items) for (const t of it.tags) set.add(t);
    return [...set].sort();
  }
}
