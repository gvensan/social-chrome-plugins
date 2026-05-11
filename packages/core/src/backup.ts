import { clearAll, dumpAll, importAll } from './storage';

const META_KEY = '__toolkit';
const SCHEMA = 1;

export interface BackupMeta {
  /** Plugin identity — must match the importing plugin's id. */
  plugin: string;
  /** Plugin display name (informational). */
  pluginName: string;
  /** Version of the plugin that produced the export. */
  version: string;
  /** Backup-format schema version. Bumped if the wrapper shape changes. */
  schema: number;
  /** ISO timestamp of when the export was produced. */
  exportedAt: string;
}

export interface ExportFile extends Record<string, unknown> {
  [META_KEY]: BackupMeta;
}

export interface ExportArgs {
  pluginId: string;
  pluginName: string;
  version: string;
}

export type ImportResult =
  | { ok: true; meta: BackupMeta; restoredKeys: string[] }
  | { ok: false; reason: string };

export type Validator = (
  payload: Record<string, unknown>
) => { ok: true } | { ok: false; reason: string };

export interface RestoreOptions {
  /**
   * Plugin-specific shape validator. Runs after metadata checks pass
   * AND after the built-in `settings` / `savedSearches` shape gates,
   * but before any storage write. Returning `{ ok: false }` aborts
   * the import with that reason and leaves storage untouched.
   *
   * Use this to assert plugin-specific keys (e.g. saved entities)
   * have the shapes the plugin's load paths expect — the load paths
   * are otherwise type-asserted, so a malformed value would render
   * the plugin unusable until the user clears storage manually.
   */
  validate?: Validator;
}

/**
 * Build an export object: dumps every chrome.storage.local key the
 * plugin owns and wraps it with identifying metadata so an importer
 * can validate the file is for the right plugin/version.
 */
export const buildExport = async (args: ExportArgs): Promise<ExportFile> => {
  const data = await dumpAll();
  return {
    [META_KEY]: {
      plugin: args.pluginId,
      pluginName: args.pluginName,
      version: args.version,
      schema: SCHEMA,
      exportedAt: new Date().toISOString(),
    } satisfies BackupMeta,
    ...data,
  };
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Built-in shape gate for the well-known keys every plugin uses.
 * Keys not listed here are passed through untouched — plugins can
 * layer their own validator via {@link RestoreOptions.validate} for
 * plugin-specific keys.
 *
 * Only validates keys that ARE present in the payload — missing keys
 * are fine (the plugin's load path falls back to defaults).
 */
const validateDefaultShapes = (
  payload: Record<string, unknown>
): { ok: true } | { ok: false; reason: string } => {
  if ('settings' in payload && !isPlainObject(payload.settings)) {
    return {
      ok: false,
      reason: '`settings` must be an object.',
    };
  }
  if ('savedSearches' in payload) {
    const ss = payload.savedSearches;
    if (!Array.isArray(ss)) {
      return {
        ok: false,
        reason: '`savedSearches` must be an array.',
      };
    }
    for (let i = 0; i < ss.length; i++) {
      const item = ss[i];
      if (
        !isPlainObject(item) ||
        typeof item['id'] !== 'string' ||
        typeof item['name'] !== 'string'
      ) {
        return {
          ok: false,
          reason: `\`savedSearches[${i}]\` is missing required fields (id, name).`,
        };
      }
    }
  }
  return { ok: true };
};

/**
 * Validate and apply an imported file. The file MUST carry the
 * `__toolkit` metadata header AND its `plugin` field MUST match the
 * importing plugin's id.
 *
 * On success, restore is a **replacement**, not a merge: any key
 * present locally but absent from the payload is removed first, so
 * importing an older export reliably rolls the plugin back to that
 * exact state. The caller is still responsible for reloading their
 * in-memory stores afterward.
 */
export const restoreImport = async (
  raw: unknown,
  expectedPluginId: string,
  options: RestoreOptions = {}
): Promise<ImportResult> => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, reason: 'File is not a JSON object.' };
  }
  const obj = raw as Record<string, unknown>;
  const meta = obj[META_KEY] as Partial<BackupMeta> | undefined;
  if (!meta || typeof meta !== 'object') {
    return {
      ok: false,
      reason:
        "File doesn't have the toolkit metadata header. It may not be a toolkit export, or it may be from an older version. Refusing to import to avoid corrupting your settings.",
    };
  }
  if (typeof meta.plugin !== 'string') {
    return { ok: false, reason: 'Metadata is missing the `plugin` field.' };
  }
  if (meta.plugin !== expectedPluginId) {
    return {
      ok: false,
      reason: `This file is from the "${meta.plugin}" plugin, but you're importing into the "${expectedPluginId}" plugin. Open the matching plugin's Settings to import this file.`,
    };
  }
  if (typeof meta.schema === 'number' && meta.schema > SCHEMA) {
    return {
      ok: false,
      reason: `File uses a newer backup schema (${meta.schema}) than this build supports (${SCHEMA}). Update the extension and try again.`,
    };
  }
  const { [META_KEY]: _drop, ...payload } = obj;
  void _drop;

  // Built-in shape gate for `settings` / `savedSearches`. Catches
  // hand-edited or version-skewed files that would otherwise poison
  // storage and brick the plugin's UI.
  const defaultCheck = validateDefaultShapes(payload);
  if (!defaultCheck.ok) {
    return {
      ok: false,
      reason: `Backup file failed validation: ${defaultCheck.reason}`,
    };
  }

  // Plugin-supplied validator (optional) — runs only if the built-in
  // gate already passed.
  if (options.validate) {
    const userCheck = options.validate(payload);
    if (!userCheck.ok) {
      return {
        ok: false,
        reason: `Backup file failed validation: ${userCheck.reason}`,
      };
    }
  }

  // Replacement, not merge: clear current state then write the payload.
  // This is essential — a merge would leave keys present locally but
  // absent from the backup in place, so re-importing an older export
  // would not reliably roll back.
  await clearAll();
  await importAll(payload);
  return {
    ok: true,
    meta: meta as BackupMeta,
    restoredKeys: Object.keys(payload),
  };
};
