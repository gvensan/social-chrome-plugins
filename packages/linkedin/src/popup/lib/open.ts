import { openUrl as coreOpen } from '@toolkit/core';
import { settings } from '../stores/settings.svelte';

/**
 * Plugin-local wrapper around core `openUrl` that reads the user's
 * `openMode` setting and routes the navigation accordingly. Components
 * that just want "Open this URL" import from here so they don't need
 * to know about the settings store.
 */
export const openUrl = (url: string): void => {
  coreOpen(url, settings.value.openMode);
};
