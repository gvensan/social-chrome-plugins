/**
 * Curated set of well-known YouTube `sp=` preset values. YouTube's `sp=`
 * parameter is an opaque base64-protobuf encoding; we don't reverse-engineer
 * it. Instead we hardcode a small set of community-known values that map
 * to common filter combinations on the YouTube UI.
 *
 * If YouTube ever changes these tokens, the plugin's URLs will still load
 * but the filter behavior may degrade — values may need refreshing.
 */
export type YouTubeFilterPreset =
  | 'none'
  | 'today'
  | 'this-week'
  | 'this-month'
  | 'this-year'
  | 'sort-upload-date'
  | 'sort-view-count'
  | 'sort-rating'
  | 'short-videos'
  | 'long-videos'
  | 'cc-license'
  | 'hd-only'
  | 'subtitles'
  | 'channels'
  | 'playlists'
  | 'movies';

export interface YouTubeSearchInput {
  keywords?: string;
  preset?: YouTubeFilterPreset;
}

export type SearchInput =
  | { type: 'search'; input: YouTubeSearchInput }
  | { type: 'special'; url: string };

export const emptySearch = (): SearchInput => ({
  type: 'search',
  input: {},
});
