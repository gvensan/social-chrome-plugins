// Hugging Face exposes three primary discovery surfaces, each with its
// own URL base and its own filter taxonomy. Models, Datasets, and
// Spaces are all bookmarkable via query params; we model each as a
// vertical with a typed input.
export type HFSearchType = 'models' | 'datasets' | 'spaces';

// Sort axis is the same across all three verticals — HF normalised
// these. `direction` flips the ordering; `trending` is the only sort
// where the default direction is meaningful.
export type SortKey =
  | 'trending'
  | 'downloads'
  | 'likes'
  | 'created'
  | 'modified';

export type SortDirection = 'desc' | 'asc';

// Datasets-specific multilinguality flag. Models don't have this — they
// have a `language` filter that takes a single ISO code or "multilingual".
export type Multilinguality =
  | 'monolingual'
  | 'multilingual'
  | 'translation';

// Spaces SDK — the framework the Space is built on. Drives the runtime.
export type SpaceSdk = 'gradio' | 'streamlit' | 'docker' | 'static';

export interface ModelsInput {
  keywords?: string;
  /** pipeline_tag — text-generation, image-classification, etc. */
  pipelineTag?: string;
  /** library — transformers, diffusers, sentence-transformers, gguf, mlx. */
  library?: string;
  /** language ISO code or "multilingual". */
  language?: string;
  /** license slug — mit, apache-2.0, llama2, openrail. */
  license?: string;
  /** Trained-on dataset slug. Filters to models referencing this dataset. */
  dataset?: string;
  /** author or org slug — meta-llama, mistralai, etc. */
  author?: string;
  /** Free-form `other:<tag>` filters — appended one per entry. */
  other?: string[];
  sort?: SortKey;
  direction?: SortDirection;
}

export interface DatasetsInput {
  keywords?: string;
  /** task_categories — the broad task family (text-classification, etc.). */
  taskCategory?: string;
  /** task_ids — the specific task within a category (sentiment-classification). */
  taskId?: string;
  language?: string;
  license?: string;
  /** size_categories — n<1K, 1K<n<10K, 10K<n<100K, ..., n>1T. */
  sizeCategory?: string;
  /** modality — text, image, audio, video, tabular, 3d, geospatial, time-series. */
  modality?: string;
  /** Mono- vs multi-lingual taxonomy. */
  multilinguality?: Multilinguality;
  /** Source-dataset filter (e.g. derived from a specific upstream). */
  sourceDataset?: string;
  sort?: SortKey;
  direction?: SortDirection;
}

export interface SpacesInput {
  keywords?: string;
  /** Filter by SDK (the Space framework). */
  sdk?: SpaceSdk;
  /** pipeline_tag — Spaces are tagged by the task they demonstrate. */
  pipelineTag?: string;
  /** Find Spaces that *use* a specific model (model slug). */
  models?: string;
  /** Find Spaces that *use* a specific dataset. */
  datasets?: string;
  sort?: SortKey;
  direction?: SortDirection;
}

export type SearchInput =
  | { type: 'models'; input: ModelsInput }
  | { type: 'datasets'; input: DatasetsInput }
  | { type: 'spaces'; input: SpacesInput }
  | { type: 'special'; url: string };

export const emptyInputFor = (type: HFSearchType): SearchInput => {
  switch (type) {
    case 'models':
      return { type: 'models', input: {} };
    case 'datasets':
      return { type: 'datasets', input: {} };
    case 'spaces':
      return { type: 'spaces', input: {} };
  }
};
