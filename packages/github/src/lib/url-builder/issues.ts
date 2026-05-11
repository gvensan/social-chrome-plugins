import { buildSearchUrl, composeQ, qualifier } from './encode';
import type { IssuesInput } from './types';

export const buildIssuesUrl = (input: IssuesInput = {}): string => {
  const fragments: Array<string | undefined> = [
    input.keywords?.trim() || undefined,
    'is:issue',
    input.state ? `is:${input.state}` : undefined,
    qualifier('repo', input.repo),
    qualifier('user', input.user),
    qualifier('language', input.language),
    qualifier('author', input.author),
    qualifier('assignee', input.assignee),
    qualifier('label', input.label),
    input.unassigned ? 'no:assignee' : undefined,
    qualifier('created', input.created),
    qualifier('sort', input.sort),
  ];
  return buildSearchUrl(composeQ(fragments), 'issues');
};
