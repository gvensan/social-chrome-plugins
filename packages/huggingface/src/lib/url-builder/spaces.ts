import { buildQuery, sanitizeSlug, trimOpt } from './encode';
import type { SpacesInput } from './types';

const BASE = 'https://huggingface.co/spaces';

export const buildSpacesUrl = (input: SpacesInput = {}): string => {
  const pairs: Array<readonly [string, string | undefined]> = [
    ['search', trimOpt(input.keywords)],
    ['sdk', input.sdk],
    ['pipeline_tag', trimOpt(input.pipelineTag)],
    ['models', sanitizeSlug(input.models)],
    ['datasets', sanitizeSlug(input.datasets)],
    ['sort', input.sort],
    ['direction', input.direction === 'asc' ? '-1' : undefined],
  ];
  return BASE + buildQuery(pairs);
};
