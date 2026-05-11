import type {
  IssueSort,
  IssueState,
  RepoSort,
  UserType,
} from './url-builder/types';

export interface Option<T> {
  value: T;
  label: string;
}

export const REPO_SORT_OPTIONS: ReadonlyArray<Option<RepoSort>> = [
  { value: 'stars', label: 'Most stars' },
  { value: 'forks', label: 'Most forks' },
  { value: 'updated', label: 'Recently updated' },
];

export const ISSUE_SORT_OPTIONS: ReadonlyArray<Option<IssueSort>> = [
  { value: 'created', label: 'Newest' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'comments', label: 'Most discussed' },
];

export const ISSUE_STATE_OPTIONS: ReadonlyArray<Option<IssueState>> = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

export const USER_TYPE_OPTIONS: ReadonlyArray<Option<UserType>> = [
  { value: 'user', label: 'Person' },
  { value: 'org', label: 'Organization' },
];
