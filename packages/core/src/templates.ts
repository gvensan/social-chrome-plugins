/**
 * Shared utilities for the per-plugin Templates view. Each plugin
 * defines its own Template interface (because the `search` field is
 * platform-specific), but they all share `id`, `title`, `description`,
 * `experimental`, and `group`. This helper bins by `group` while
 * preserving first-appearance order, so plugins can control section
 * ordering by laying out their templates list in the desired order.
 */

interface MinimalTemplate {
  id: string;
  group?: string;
}

export interface TemplateGroup<T extends MinimalTemplate> {
  name: string;
  templates: T[];
}

const FALLBACK_GROUP = 'Other';

export const groupTemplates = <T extends MinimalTemplate>(
  templates: ReadonlyArray<T>
): TemplateGroup<T>[] => {
  const map = new Map<string, T[]>();
  for (const t of templates) {
    const key = t.group ?? FALLBACK_GROUP;
    let bucket = map.get(key);
    if (!bucket) {
      bucket = [];
      map.set(key, bucket);
    }
    bucket.push(t);
  }
  return [...map.entries()].map(([name, ts]) => ({ name, templates: ts }));
};
