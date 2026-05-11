import type {
  DatasetsInput,
  ModelsInput,
  SearchInput,
  SpacesInput,
} from './url-builder/types';

const summarizeModels = (i: ModelsInput): string => {
  const bits: string[] = ['type: models'];
  if (i.keywords?.trim()) bits.push(`search: "${i.keywords.trim()}"`);
  if (i.pipelineTag) bits.push(`task:${i.pipelineTag}`);
  if (i.library) bits.push(`library:${i.library}`);
  if (i.language) bits.push(`lang:${i.language}`);
  if (i.license) bits.push(`license:${i.license}`);
  if (i.dataset) bits.push(`dataset:${i.dataset}`);
  if (i.author) bits.push(`author:${i.author}`);
  if (i.other && i.other.length) bits.push(`other:${i.other.join(',')}`);
  if (i.sort) bits.push(`sort:${i.sort}`);
  if (i.direction === 'asc') bits.push('asc');
  return bits.join(' · ');
};

const summarizeDatasets = (i: DatasetsInput): string => {
  const bits: string[] = ['type: datasets'];
  if (i.keywords?.trim()) bits.push(`search: "${i.keywords.trim()}"`);
  if (i.taskCategory) bits.push(`task_categories:${i.taskCategory}`);
  if (i.taskId) bits.push(`task_ids:${i.taskId}`);
  if (i.language) bits.push(`lang:${i.language}`);
  if (i.license) bits.push(`license:${i.license}`);
  if (i.sizeCategory) bits.push(`size:${i.sizeCategory}`);
  if (i.modality) bits.push(`modality:${i.modality}`);
  if (i.multilinguality) bits.push(`${i.multilinguality}`);
  if (i.sourceDataset) bits.push(`source:${i.sourceDataset}`);
  if (i.sort) bits.push(`sort:${i.sort}`);
  if (i.direction === 'asc') bits.push('asc');
  return bits.join(' · ');
};

const summarizeSpaces = (i: SpacesInput): string => {
  const bits: string[] = ['type: spaces'];
  if (i.keywords?.trim()) bits.push(`search: "${i.keywords.trim()}"`);
  if (i.sdk) bits.push(`sdk:${i.sdk}`);
  if (i.pipelineTag) bits.push(`task:${i.pipelineTag}`);
  if (i.models) bits.push(`uses-model:${i.models}`);
  if (i.datasets) bits.push(`uses-dataset:${i.datasets}`);
  if (i.sort) bits.push(`sort:${i.sort}`);
  if (i.direction === 'asc') bits.push('asc');
  return bits.join(' · ');
};

export const summarizeSearch = (s: SearchInput): string => {
  switch (s.type) {
    case 'models':
      return summarizeModels(s.input);
    case 'datasets':
      return summarizeDatasets(s.input);
    case 'spaces':
      return summarizeSpaces(s.input);
    case 'special':
      try {
        const u = new URL(s.url);
        return `direct: ${u.hostname}${u.pathname}${u.search}`;
      } catch {
        return `direct: ${s.url}`;
      }
  }
};
