import { buildSearchUrl, composeQ, qualifier } from './encode';
import type { PullRequestsInput } from './types';

export const buildPullRequestsUrl = (
  input: PullRequestsInput = {}
): string => {
  const fragments: Array<string | undefined> = [
    input.keywords?.trim() || undefined,
    'is:pr',
    input.state ? `is:${input.state}` : undefined,
    input.draft === true
      ? 'draft:true'
      : input.draft === false
        ? 'draft:false'
        : undefined,
    qualifier('repo', input.repo),
    qualifier('user', input.user),
    qualifier('author', input.author),
    qualifier('assignee', input.assignee),
    qualifier('label', input.label),
    qualifier('created', input.created),
    qualifier('review-requested', input.reviewRequested),
    qualifier('sort', input.sort),
  ];
  return buildSearchUrl(composeQ(fragments), 'pullrequests');
};
