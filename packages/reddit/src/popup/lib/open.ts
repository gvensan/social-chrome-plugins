import { openUrl as coreOpen } from '@toolkit/core';
import { settings } from '../stores/settings.svelte';

export const openUrl = (url: string): void => {
  coreOpen(url, settings.value.openMode);
};
