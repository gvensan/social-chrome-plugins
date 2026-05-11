import type { YouTubeFilterPreset } from './url-builder/types';

export interface Option<T> {
  value: T;
  label: string;
}

export const PRESET_OPTIONS: ReadonlyArray<Option<YouTubeFilterPreset>> = [
  { value: 'none', label: 'No filter' },
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This week' },
  { value: 'this-month', label: 'This month' },
  { value: 'this-year', label: 'This year' },
  { value: 'sort-upload-date', label: 'Sort by upload date' },
  { value: 'sort-view-count', label: 'Sort by view count' },
  { value: 'sort-rating', label: 'Sort by rating' },
  { value: 'short-videos', label: 'Short (<4 min)' },
  { value: 'long-videos', label: 'Long (>20 min)' },
  { value: 'cc-license', label: 'Creative Commons license' },
  { value: 'hd-only', label: 'HD / 4K only' },
  { value: 'subtitles', label: 'Has subtitles' },
  { value: 'channels', label: 'Channels' },
  { value: 'playlists', label: 'Playlists' },
  { value: 'movies', label: 'Movies' },
];
