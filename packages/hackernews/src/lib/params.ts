import type { HNDateRange, HNSort, HNType } from './url-builder/types';

export interface Option<T> {
  value: T;
  label: string;
}

export const TYPE_OPTIONS: ReadonlyArray<Option<HNType>> = [
  { value: 'all', label: 'Everything' },
  { value: 'story', label: 'Stories' },
  { value: 'comment', label: 'Comments' },
  { value: 'ask_hn', label: 'Ask HN' },
  { value: 'show_hn', label: 'Show HN' },
  { value: 'poll', label: 'Polls' },
  { value: 'job', label: 'Jobs' },
];

export const SORT_OPTIONS: ReadonlyArray<Option<HNSort>> = [
  { value: 'byPopularity', label: 'By popularity' },
  { value: 'byDate', label: 'By date' },
];

export const DATE_RANGE_OPTIONS: ReadonlyArray<Option<HNDateRange>> = [
  { value: 'all', label: 'All time' },
  { value: 'last24h', label: 'Past 24 hours' },
  { value: 'pastWeek', label: 'Past week' },
  { value: 'pastMonth', label: 'Past month' },
  { value: 'pastYear', label: 'Past year' },
  { value: 'custom', label: 'Custom range' },
];
