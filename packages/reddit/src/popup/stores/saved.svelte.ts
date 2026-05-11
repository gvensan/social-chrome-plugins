import { SavedSearchesStore, type SavedSearchBase } from '@toolkit/core';
import type { SearchInput } from '@lib/url-builder';

export type SavedSearch = SavedSearchBase<SearchInput>;
export const savedSearches = new SavedSearchesStore<SearchInput>();
