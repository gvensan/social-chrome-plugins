import { buildSearchUrl, composeQ, qualifier } from './encode';
import type { CodeInput } from './types';

export const buildCodeUrl = (input: CodeInput = {}): string => {
  const fragments: Array<string | undefined> = [
    input.keywords?.trim() || undefined,
    qualifier('user', input.user),
    qualifier('repo', input.repo),
    qualifier('language', input.language),
    qualifier('path', input.path),
    qualifier('extension', input.extension),
    input.inFile ? 'in:file' : undefined,
    input.inPath ? 'in:path' : undefined,
  ];
  return buildSearchUrl(composeQ(fragments), 'code');
};
