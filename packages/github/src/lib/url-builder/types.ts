export type GitHubSearchType =
  | 'repositories'
  | 'code'
  | 'issues'
  | 'pullrequests'
  | 'users';

export type SearchType = GitHubSearchType;

export type RepoSort = 'stars' | 'forks' | 'updated';
export type IssueSort = 'created' | 'updated' | 'comments';
export type IssueState = 'open' | 'closed';
export type UserType = 'user' | 'org';

export interface RepositoriesInput {
  keywords?: string;
  user?: string;
  language?: string;
  topic?: string;
  license?: string;
  stars?: string;
  forks?: string;
  pushed?: string;
  archived?: boolean;
  sort?: RepoSort;
}

export interface CodeInput {
  keywords?: string;
  user?: string;
  repo?: string;
  language?: string;
  path?: string;
  extension?: string;
  inFile?: boolean;
  inPath?: boolean;
}

export interface IssuesInput {
  keywords?: string;
  repo?: string;
  user?: string;
  language?: string;
  state?: IssueState;
  author?: string;
  assignee?: string;
  label?: string;
  /** Restrict to issues with no assignee — emits `no:assignee`. */
  unassigned?: boolean;
  created?: string;
  sort?: IssueSort;
}

export interface PullRequestsInput {
  keywords?: string;
  repo?: string;
  user?: string;
  state?: IssueState;
  author?: string;
  assignee?: string;
  label?: string;
  created?: string;
  reviewRequested?: string;
  draft?: boolean;
  sort?: IssueSort;
}

export interface UsersInput {
  keywords?: string;
  location?: string;
  language?: string;
  followers?: string;
  repos?: string;
  type?: UserType;
}

export type SearchInput =
  | { type: 'repositories'; input: RepositoriesInput }
  | { type: 'code'; input: CodeInput }
  | { type: 'issues'; input: IssuesInput }
  | { type: 'pullrequests'; input: PullRequestsInput }
  | { type: 'users'; input: UsersInput }
  | { type: 'special'; url: string };

export const emptyInputFor = (type: GitHubSearchType): SearchInput => {
  switch (type) {
    case 'repositories':
      return { type: 'repositories', input: {} };
    case 'code':
      return { type: 'code', input: {} };
    case 'issues':
      return { type: 'issues', input: {} };
    case 'pullrequests':
      return { type: 'pullrequests', input: {} };
    case 'users':
      return { type: 'users', input: {} };
  }
};
