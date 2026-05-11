import { loadKey, saveKey } from '@toolkit/core';

export interface Company {
  /** Numeric LinkedIn company ID. Optional — slug-only saves are valid. */
  id?: string;
  /** Company slug from a /company/<slug>/ URL. Optional — but at least
   *  one of id/slug must be set. */
  slug?: string;
  label: string;
  addedAt: number;
}

const KEY = 'companies';

/** Stable identity key for a company entry — used for dedup + chip toggling. */
export const companyKey = (c: Pick<Company, 'id' | 'slug'>): string =>
  c.id ? `id:${c.id}` : `slug:${c.slug ?? ''}`;

/**
 * Derive the canonical LinkedIn company-page URL. Prefers the slug
 * (gives the canonical pretty URL); falls back to the numeric ID
 * (LinkedIn redirects ID URLs to the slug URL). Returns null when the
 * entry has neither — shouldn't happen since `add()` requires at least
 * one, but the type system doesn't enforce that.
 */
export const companyPageUrl = (
  c: Pick<Company, 'id' | 'slug'>
): string | null => {
  if (c.slug) return `https://www.linkedin.com/company/${c.slug}/`;
  if (c.id) return `https://www.linkedin.com/company/${c.id}/`;
  return null;
};

const sanitizeCompany = (raw: unknown): Company | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === 'string' && r.id.trim() ? r.id : undefined;
  const slug =
    typeof r.slug === 'string' && r.slug.trim() ? r.slug : undefined;
  if (!id && !slug) return null;
  const label =
    typeof r.label === 'string' && r.label.trim()
      ? r.label
      : (id ?? slug ?? 'Company');
  const addedAt = typeof r.addedAt === 'number' ? r.addedAt : Date.now();
  return {
    ...(id ? { id } : {}),
    ...(slug ? { slug } : {}),
    label,
    addedAt,
  };
};

class CompaniesStore {
  items = $state<Company[]>([]);
  loaded = $state(false);

  async load(): Promise<void> {
    const raw = await loadKey<unknown>(KEY, []);
    const arr = Array.isArray(raw) ? raw : [];
    const cleaned = arr
      .map(sanitizeCompany)
      .filter((c): c is Company => c !== null);
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
    return this.items.some((c) => companyKey(c) === key);
  }

  byKey(key: string): Company | undefined {
    return this.items.find((c) => companyKey(c) === key);
  }

  /**
   * Add a company. Caller must supply at least one of id/slug.
   * Returns the stored record, or null if a company with the same
   * identity already exists.
   */
  async add(input: {
    id?: string;
    slug?: string;
    label: string;
  }): Promise<Company | null> {
    if (!input.id && !input.slug) return null;
    const key = companyKey(input);
    if (this.hasKey(key)) return null;
    const record: Company = {
      ...(input.id ? { id: input.id } : {}),
      ...(input.slug ? { slug: input.slug } : {}),
      label: input.label.trim() || (input.id ?? input.slug ?? 'Company'),
      addedAt: Date.now(),
    };
    this.items = [record, ...this.items];
    await this.persist();
    return record;
  }

  async remove(key: string): Promise<void> {
    this.items = this.items.filter((c) => companyKey(c) !== key);
    await this.persist();
  }

  async rename(key: string, label: string): Promise<void> {
    const next = label.trim();
    this.items = this.items.map((c) =>
      companyKey(c) === key ? { ...c, label: next || c.label } : c
    );
    await this.persist();
  }

  /**
   * Promote a slug-only entry to an ID-bearing entry by adding the
   * numeric ID in place. The entry's identity key changes from
   * `slug:<slug>` to `id:<id>`. Returns the upgraded record, or null
   * if no slug-only entry exists for that slug, or if an ID-bearing
   * entry for the same ID already exists (caller should handle the
   * dedup case, e.g. by removing one).
   */
  async upgradeSlugToId(slug: string, id: string): Promise<Company | null> {
    const oldKey = `slug:${slug}`;
    const existing = this.byKey(oldKey);
    if (!existing) return null;
    if (this.hasKey(`id:${id}`)) return null;
    const upgraded: Company = { ...existing, id };
    this.items = this.items.map((c) =>
      companyKey(c) === oldKey ? upgraded : c
    );
    await this.persist();
    return upgraded;
  }
}

export const companies = new CompaniesStore();
