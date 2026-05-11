import { describe, expect, it } from 'vitest';
import {
  buildDatasetsUrl,
  buildModelsUrl,
  buildSpacesUrl,
  buildUrl,
  normaliseLicense,
  sanitizeSlug,
} from '../src/lib/url-builder';
import { BUILTIN_TEMPLATES } from '../src/lib/templates';

const HOST = 'huggingface.co';

// ─── encode helpers ─────────────────────────────────────────────────

describe('sanitizeSlug', () => {
  it('returns undefined for empty/whitespace', () => {
    expect(sanitizeSlug(undefined)).toBeUndefined();
    expect(sanitizeSlug('')).toBeUndefined();
    expect(sanitizeSlug('   ')).toBeUndefined();
  });

  it('strips leading @, leading and trailing slash', () => {
    expect(sanitizeSlug('@meta-llama')).toBe('meta-llama');
    expect(sanitizeSlug('/meta-llama')).toBe('meta-llama');
    expect(sanitizeSlug('meta-llama/')).toBe('meta-llama');
    expect(sanitizeSlug('/meta-llama/')).toBe('meta-llama');
  });

  it('preserves nested slugs (org/model)', () => {
    expect(sanitizeSlug('stabilityai/stable-diffusion-3')).toBe(
      'stabilityai/stable-diffusion-3'
    );
  });
});

describe('normaliseLicense', () => {
  it('trims whitespace', () => {
    expect(normaliseLicense('  apache-2.0 ')).toBe('apache-2.0');
  });
  it('returns undefined for empty', () => {
    expect(normaliseLicense('')).toBeUndefined();
    expect(normaliseLicense(undefined)).toBeUndefined();
  });
});

// ─── models ─────────────────────────────────────────────────────────

describe('buildModelsUrl', () => {
  it('empty input → bare /models page', () => {
    expect(buildModelsUrl({})).toBe(`https://${HOST}/models`);
  });

  it('keywords-only → ?search=', () => {
    const url = buildModelsUrl({ keywords: 'llama 3' });
    const u = new URL(url);
    expect(u.pathname).toBe('/models');
    expect(u.searchParams.get('search')).toBe('llama 3');
  });

  it('full input emits each parameter once', () => {
    const url = buildModelsUrl({
      keywords: 'embedding',
      pipelineTag: 'sentence-similarity',
      library: 'sentence-transformers',
      language: 'en',
      license: 'apache-2.0',
      dataset: 'wikipedia',
      author: 'sentence-transformers',
      sort: 'downloads',
    });
    const u = new URL(url);
    expect(u.searchParams.get('search')).toBe('embedding');
    expect(u.searchParams.get('pipeline_tag')).toBe('sentence-similarity');
    expect(u.searchParams.get('library')).toBe('sentence-transformers');
    expect(u.searchParams.get('language')).toBe('en');
    expect(u.searchParams.get('license')).toBe('apache-2.0');
    expect(u.searchParams.get('dataset')).toBe('wikipedia');
    expect(u.searchParams.get('author')).toBe('sentence-transformers');
    expect(u.searchParams.get('sort')).toBe('downloads');
    expect(u.searchParams.has('direction')).toBe(false);
  });

  it('asc direction → direction=-1', () => {
    const url = buildModelsUrl({ sort: 'created', direction: 'asc' });
    expect(new URL(url).searchParams.get('direction')).toBe('-1');
  });

  it('desc direction is omitted (default)', () => {
    const url = buildModelsUrl({ sort: 'created', direction: 'desc' });
    expect(new URL(url).searchParams.has('direction')).toBe(false);
  });

  it('repeats `other=` once per tag', () => {
    const url = buildModelsUrl({ other: ['conversational', 'agent'] });
    const u = new URL(url);
    expect(u.searchParams.getAll('other')).toEqual([
      'conversational',
      'agent',
    ]);
  });

  it('strips author leading @', () => {
    const url = buildModelsUrl({ author: '@meta-llama' });
    expect(new URL(url).searchParams.get('author')).toBe('meta-llama');
  });

  it('omits empty/blank fields', () => {
    const url = buildModelsUrl({
      keywords: '   ',
      pipelineTag: '',
      library: undefined,
    });
    expect(url).toBe(`https://${HOST}/models`);
  });
});

// ─── datasets ───────────────────────────────────────────────────────

describe('buildDatasetsUrl', () => {
  it('empty input → bare /datasets page', () => {
    expect(buildDatasetsUrl({})).toBe(`https://${HOST}/datasets`);
  });

  it('full input emits each parameter once', () => {
    const url = buildDatasetsUrl({
      keywords: 'common voice',
      taskCategory: 'automatic-speech-recognition',
      taskId: 'language-identification',
      language: 'en',
      license: 'cc-by-4.0',
      sizeCategory: '10M<n<100M',
      modality: 'audio',
      multilinguality: 'multilingual',
      sourceDataset: 'mozilla/common-voice',
      sort: 'downloads',
    });
    const u = new URL(url);
    expect(u.searchParams.get('search')).toBe('common voice');
    expect(u.searchParams.get('task_categories')).toBe(
      'automatic-speech-recognition'
    );
    expect(u.searchParams.get('task_ids')).toBe('language-identification');
    expect(u.searchParams.get('language')).toBe('en');
    expect(u.searchParams.get('license')).toBe('cc-by-4.0');
    expect(u.searchParams.get('size_categories')).toBe('10M<n<100M');
    expect(u.searchParams.get('modality')).toBe('audio');
    expect(u.searchParams.get('multilinguality')).toBe('multilingual');
    expect(u.searchParams.get('source_datasets')).toBe(
      'mozilla/common-voice'
    );
    expect(u.searchParams.get('sort')).toBe('downloads');
  });
});

// ─── spaces ─────────────────────────────────────────────────────────

describe('buildSpacesUrl', () => {
  it('empty input → bare /spaces page', () => {
    expect(buildSpacesUrl({})).toBe(`https://${HOST}/spaces`);
  });

  it('sdk + sort', () => {
    const url = buildSpacesUrl({ sdk: 'gradio', sort: 'trending' });
    const u = new URL(url);
    expect(u.searchParams.get('sdk')).toBe('gradio');
    expect(u.searchParams.get('sort')).toBe('trending');
  });

  it('models / datasets slug filters', () => {
    const url = buildSpacesUrl({
      models: 'stabilityai/stable-diffusion-3-medium',
      datasets: 'wikipedia',
    });
    const u = new URL(url);
    expect(u.searchParams.get('models')).toBe(
      'stabilityai/stable-diffusion-3-medium'
    );
    expect(u.searchParams.get('datasets')).toBe('wikipedia');
  });

  it('keywords + pipeline_tag', () => {
    const url = buildSpacesUrl({
      keywords: 'chatbot',
      pipelineTag: 'conversational',
    });
    const u = new URL(url);
    expect(u.searchParams.get('search')).toBe('chatbot');
    expect(u.searchParams.get('pipeline_tag')).toBe('conversational');
  });
});

// ─── dispatcher + templates ─────────────────────────────────────────

describe('buildUrl dispatcher', () => {
  it('models branch → /models URL', () => {
    const url = buildUrl({ type: 'models', input: { keywords: 'x' } });
    const u = new URL(url);
    expect(u.hostname).toBe(HOST);
    expect(u.pathname).toBe('/models');
  });

  it('datasets branch → /datasets URL', () => {
    const url = buildUrl({ type: 'datasets', input: { keywords: 'x' } });
    expect(new URL(url).pathname).toBe('/datasets');
  });

  it('spaces branch → /spaces URL', () => {
    const url = buildUrl({ type: 'spaces', input: { keywords: 'x' } });
    expect(new URL(url).pathname).toBe('/spaces');
  });

  it('special branch passes through', () => {
    const u = 'https://huggingface.co/papers';
    expect(buildUrl({ type: 'special', url: u })).toBe(u);
  });
});

describe('built-in templates', () => {
  it('every template produces a huggingface.co URL', () => {
    for (const t of BUILTIN_TEMPLATES) {
      const url = buildUrl(t.search);
      const parsed = new URL(url);
      expect(parsed.hostname).toBe(HOST);
    }
  });

  it('every template has a unique id', () => {
    const ids = BUILTIN_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('templates cover at least four groups', () => {
    const groups = new Set(BUILTIN_TEMPLATES.map((t) => t.group));
    // Personal, Models, Datasets, Spaces
    expect(groups.size).toBeGreaterThanOrEqual(4);
  });
});
