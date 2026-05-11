import type { MediaFilter, ReplyFilter, XSearchMode } from './url-builder/types';

export interface Option<T> {
  value: T;
  label: string;
}

export const MODE_TABS: ReadonlyArray<{ id: XSearchMode; label: string }> = [
  { id: 'top', label: 'Top' },
  { id: 'latest', label: 'Latest' },
  { id: 'people', label: 'People' },
  { id: 'media', label: 'Media' },
];

export const REPLY_FILTER_OPTIONS: ReadonlyArray<Option<ReplyFilter>> = [
  { value: 'include', label: 'Include replies' },
  { value: 'only', label: 'Replies only' },
  { value: 'exclude', label: 'No replies' },
];

export const MEDIA_FILTER_OPTIONS: ReadonlyArray<Option<MediaFilter>> = [
  { value: 'any', label: 'Any' },
  { value: 'images', label: 'Images' },
  { value: 'videos', label: 'Videos' },
  { value: 'links', label: 'Links' },
];
