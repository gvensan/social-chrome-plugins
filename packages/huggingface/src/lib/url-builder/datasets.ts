import {
  buildQuery,
  normaliseLicense,
  sanitizeSlug,
  trimOpt,
} from './encode';
import type { DatasetsInput } from './types';

const BASE = 'https://huggingface.co/datasets';

export const buildDatasetsUrl = (input: DatasetsInput = {}): string => {
  const pairs: Array<readonly [string, string | undefined]> = [
    ['search', trimOpt(input.keywords)],
    ['task_categories', trimOpt(input.taskCategory)],
    ['task_ids', trimOpt(input.taskId)],
    ['language', trimOpt(input.language)],
    ['license', normaliseLicense(input.license)],
    ['size_categories', trimOpt(input.sizeCategory)],
    ['modality', trimOpt(input.modality)],
    ['multilinguality', input.multilinguality],
    ['source_datasets', sanitizeSlug(input.sourceDataset)],
    ['sort', input.sort],
    ['direction', input.direction === 'asc' ? '-1' : undefined],
  ];
  return BASE + buildQuery(pairs);
};
