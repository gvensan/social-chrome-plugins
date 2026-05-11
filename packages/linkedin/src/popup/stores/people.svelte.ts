import { loadKey, saveKey } from '@toolkit/core';

/**
 * Saved individual on LinkedIn. Three identifier slots:
 *  - `token` — opaque profile token (`ACoAA…`). The only value usable
 *    as a `fromMember` filter today; LinkedIn dropped support for the
 *    legacy numeric URN form.
 *  - `id` — legacy numeric member ID. Kept for display continuity with
 *    older saved entries; not used as a filter value anymore.
 *  - `vanity` — slug from `linkedin.com/in/<vanity>/`. Used for keyword
 *    fallback when no token is captured, and to (re-)fetch the token.
 *
 * At least one of token/id/vanity must be set. Identity-key precedence
 * is token > id > vanity.
 */
export interface Person {
  token?: string;
  id?: string;
  vanity?: string;
  label: string;
  addedAt: number;
}

const KEY = 'people';

export const personKey = (
  p: Pick<Person, 'token' | 'id' | 'vanity'>
): string =>
  p.token
    ? `token:${p.token}`
    : p.id
      ? `id:${p.id}`
      : `vanity:${p.vanity ?? ''}`;

export const personPageUrl = (
  p: Pick<Person, 'id' | 'vanity'>
): string | null => {
  if (p.vanity) return `https://www.linkedin.com/in/${p.vanity}/`;
  // LinkedIn doesn't reliably support member-ID URLs the way it does
  // for companies. If we only have an ID, route to the URN-based view
  // (works on most surfaces; some redirect to a sales page).
  if (p.id) return `https://www.linkedin.com/in/${p.id}/`;
  return null;
};

const sanitizePerson = (raw: unknown): Person | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const token =
    typeof r.token === 'string' && /^ACoA[A-Za-z0-9_-]{20,}$/.test(r.token)
      ? r.token
      : undefined;
  const id = typeof r.id === 'string' && r.id.trim() ? r.id : undefined;
  const vanity =
    typeof r.vanity === 'string' && r.vanity.trim() ? r.vanity : undefined;
  if (!token && !id && !vanity) return null;
  const label =
    typeof r.label === 'string' && r.label.trim()
      ? r.label
      : (id ?? vanity ?? 'Person');
  const addedAt = typeof r.addedAt === 'number' ? r.addedAt : Date.now();
  return {
    ...(token ? { token } : {}),
    ...(id ? { id } : {}),
    ...(vanity ? { vanity } : {}),
    label,
    addedAt,
  };
};

class PeopleStore {
  items = $state<Person[]>([]);
  loaded = $state(false);

  async load(): Promise<void> {
    const raw = await loadKey<unknown>(KEY, []);
    const arr = Array.isArray(raw) ? raw : [];
    const cleaned = arr
      .map(sanitizePerson)
      .filter((p): p is Person => p !== null);
    this.items = cleaned;
    this.loaded = true;
    if (cleaned.length !== arr.length) {
      await this.persist();
    }
  }

  private async persist(): Promise<void> {
    await saveKey(KEY, $state.snapshot(this.items));
  }

  hasKey(key: string): boolean {
    return this.items.some((p) => personKey(p) === key);
  }

  byKey(key: string): Person | undefined {
    return this.items.find((p) => personKey(p) === key);
  }

  async add(input: {
    token?: string;
    id?: string;
    vanity?: string;
    label: string;
  }): Promise<Person | null> {
    if (!input.token && !input.id && !input.vanity) return null;
    const key = personKey(input);
    if (this.hasKey(key)) return null;
    const record: Person = {
      ...(input.token ? { token: input.token } : {}),
      ...(input.id ? { id: input.id } : {}),
      ...(input.vanity ? { vanity: input.vanity } : {}),
      label:
        input.label.trim() ||
        (input.id ?? input.vanity ?? input.token ?? 'Person'),
      addedAt: Date.now(),
    };
    this.items = [record, ...this.items];
    await this.persist();
    return record;
  }

  async remove(key: string): Promise<void> {
    this.items = this.items.filter((p) => personKey(p) !== key);
    await this.persist();
  }

  async rename(key: string, label: string): Promise<void> {
    const next = label.trim();
    this.items = this.items.map((p) =>
      personKey(p) === key ? { ...p, label: next || p.label } : p
    );
    await this.persist();
  }

  async upgradeVanityToId(vanity: string, id: string): Promise<Person | null> {
    const oldKey = `vanity:${vanity}`;
    const existing = this.byKey(oldKey);
    if (!existing) return null;
    if (this.hasKey(`id:${id}`)) return null;
    const upgraded: Person = { ...existing, id };
    this.items = this.items.map((p) =>
      personKey(p) === oldKey ? upgraded : p
    );
    await this.persist();
    return upgraded;
  }

  /**
   * Attach an opaque profile token to an existing entry, promoting its
   * identity key to `token:<token>`. Used by the "Get token" upgrade
   * flow on legacy id-only or vanity-only entries — without a token
   * the entry can't be used as a `fromMember` filter (LinkedIn dropped
   * the numeric URN form). Looks up by current key.
   */
  async upgradeToToken(currentKey: string, token: string): Promise<Person | null> {
    const existing = this.byKey(currentKey);
    if (!existing) return null;
    if (this.hasKey(`token:${token}`)) return null;
    const upgraded: Person = { ...existing, token };
    this.items = this.items.map((p) =>
      personKey(p) === currentKey ? upgraded : p
    );
    await this.persist();
    return upgraded;
  }
}

export const people = new PeopleStore();
