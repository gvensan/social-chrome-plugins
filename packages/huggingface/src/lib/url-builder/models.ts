import {
  buildQuery,
  normaliseLicense,
  repeatParam,
  sanitizeSlug,
  trimOpt,
} from './encode';
import type { ModelsInput } from './types';

const BASE = 'https://huggingface.co/models';

export const buildModelsUrl = (input: ModelsInput = {}): string => {
  const pairs: Array<readonly [string, string | undefined]> = [
    ['search', trimOpt(input.keywords)],
    ['pipeline_tag', trimOpt(input.pipelineTag)],
    ['library', trimOpt(input.library)],
    ['language', trimOpt(input.language)],
    ['license', normaliseLicense(input.license)],
    ['dataset', sanitizeSlug(input.dataset)],
    ['author', sanitizeSlug(input.author)],
    ['sort', input.sort],
    // direction is only meaningful when paired with a sort. HF
    // interprets `direction=-1` as ascending; we omit when descending
    // (the default) to keep URLs clean.
    [
      'direction',
      input.direction === 'asc' ? '-1' : undefined,
    ],
    ...repeatParam('other', input.other),
  ];
  return BASE + buildQuery(pairs);
};
