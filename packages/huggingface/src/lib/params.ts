import type {
  Multilinguality,
  SortDirection,
  SortKey,
  SpaceSdk,
} from './url-builder/types';

export interface Option<T> {
  value: T;
  label: string;
}

export const SORT_OPTIONS: ReadonlyArray<Option<SortKey>> = [
  { value: 'trending', label: 'Trending' },
  { value: 'downloads', label: 'Downloads' },
  { value: 'likes', label: 'Likes' },
  { value: 'created', label: 'Recently created' },
  { value: 'modified', label: 'Recently updated' },
];

export const DIRECTION_OPTIONS: ReadonlyArray<Option<SortDirection>> = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
];

// HF dataset size buckets — these are the literal values HF uses in
// `size_categories=`. Listed shortest-first so the dropdown reads
// naturally.
export const SIZE_CATEGORY_OPTIONS: ReadonlyArray<Option<string>> = [
  { value: 'n<1K', label: '< 1K rows' },
  { value: '1K<n<10K', label: '1K – 10K' },
  { value: '10K<n<100K', label: '10K – 100K' },
  { value: '100K<n<1M', label: '100K – 1M' },
  { value: '1M<n<10M', label: '1M – 10M' },
  { value: '10M<n<100M', label: '10M – 100M' },
  { value: '100M<n<1B', label: '100M – 1B' },
  { value: '1B<n<10B', label: '1B – 10B' },
  { value: '10B<n<100B', label: '10B – 100B' },
  { value: '100B<n<1T', label: '100B – 1T' },
  { value: 'n>1T', label: '> 1T rows' },
];

// Modality is single-select in the HF UI; the underlying URL accepts
// any of these tag values.
export const MODALITY_OPTIONS: ReadonlyArray<Option<string>> = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
  { value: 'tabular', label: 'Tabular' },
  { value: '3d', label: '3D' },
  { value: 'geospatial', label: 'Geospatial' },
  { value: 'time-series', label: 'Time series' },
];

export const MULTILINGUALITY_OPTIONS: ReadonlyArray<Option<Multilinguality>> = [
  { value: 'monolingual', label: 'Monolingual' },
  { value: 'multilingual', label: 'Multilingual' },
  { value: 'translation', label: 'Translation' },
];

export const SDK_OPTIONS: ReadonlyArray<Option<SpaceSdk>> = [
  { value: 'gradio', label: 'Gradio' },
  { value: 'streamlit', label: 'Streamlit' },
  { value: 'docker', label: 'Docker' },
  { value: 'static', label: 'Static (HTML)' },
];

// Common pipeline_tag values surfaced as quick-pick suggestions in
// placeholders / docs. The underlying field is free-text — HF accepts
// any tag, this is just to lower the discovery cost.
export const COMMON_PIPELINE_TAGS = [
  'text-generation',
  'text-classification',
  'translation',
  'summarization',
  'question-answering',
  'token-classification',
  'feature-extraction',
  'sentence-similarity',
  'fill-mask',
  'conversational',
  'image-classification',
  'image-segmentation',
  'object-detection',
  'image-to-image',
  'text-to-image',
  'image-to-text',
  'depth-estimation',
  'video-classification',
  'text-to-video',
  'audio-classification',
  'automatic-speech-recognition',
  'text-to-speech',
  'voice-activity-detection',
  'tabular-classification',
  'tabular-regression',
  'reinforcement-learning',
  'time-series-forecasting',
];

export const COMMON_LIBRARIES = [
  'transformers',
  'diffusers',
  'sentence-transformers',
  'gguf',
  'mlx',
  'onnx',
  'tensorboard',
  'safetensors',
  'peft',
  'transformers.js',
];

export const COMMON_LICENSES = [
  'mit',
  'apache-2.0',
  'bsd-3-clause',
  'cc-by-4.0',
  'cc-by-sa-4.0',
  'cc-by-nc-4.0',
  'gpl-3.0',
  'agpl-3.0',
  'llama2',
  'llama3',
  'gemma',
  'openrail',
  'openrail++',
];
