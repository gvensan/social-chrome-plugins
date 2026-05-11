import type {
  CodeInput,
  IssuesInput,
  PullRequestsInput,
  RepositoriesInput,
  SearchInput,
  UsersInput,
} from './url-builder';

const summarizeRepositories = (i: RepositoriesInput): string => {
  const bits: string[] = [];
  if (i.keywords?.trim()) bits.push(`"${i.keywords.trim()}"`);
  if (i.user) bits.push(`user:${i.user}`);
  if (i.language) bits.push(`language:${i.language}`);
  if (i.topic) bits.push(`topic:${i.topic}`);
  if (i.license) bits.push(`license:${i.license}`);
  if (i.stars) bits.push(`stars:${i.stars}`);
  if (i.forks) bits.push(`forks:${i.forks}`);
  if (i.pushed) bits.push(`pushed:${i.pushed}`);
  if (i.archived === true) bits.push('archived:true');
  if (i.archived === false) bits.push('archived:false');
  if (i.sort) bits.push(`sort:${i.sort}`);
  return bits.join(' · ');
};

const summarizeCode = (i: CodeInput): string => {
  const bits: string[] = [];
  if (i.keywords?.trim()) bits.push(`"${i.keywords.trim()}"`);
  if (i.user) bits.push(`user:${i.user}`);
  if (i.repo) bits.push(`repo:${i.repo}`);
  if (i.language) bits.push(`language:${i.language}`);
  if (i.path) bits.push(`path:${i.path}`);
  if (i.extension) bits.push(`extension:${i.extension}`);
  if (i.inFile) bits.push('in:file');
  if (i.inPath) bits.push('in:path');
  return bits.join(' · ');
};

const summarizeIssues = (i: IssuesInput): string => {
  const bits: string[] = ['is:issue'];
  if (i.state) bits.push(`is:${i.state}`);
  if (i.keywords?.trim()) bits.push(`"${i.keywords.trim()}"`);
  if (i.repo) bits.push(`repo:${i.repo}`);
  if (i.user) bits.push(`user:${i.user}`);
  if (i.language) bits.push(`language:${i.language}`);
  if (i.author) bits.push(`author:${i.author}`);
  if (i.assignee) bits.push(`assignee:${i.assignee}`);
  if (i.label) bits.push(`label:"${i.label}"`);
  if (i.unassigned) bits.push('no:assignee');
  if (i.created) bits.push(`created:${i.created}`);
  if (i.sort) bits.push(`sort:${i.sort}`);
  return bits.join(' · ');
};

const summarizePullRequests = (i: PullRequestsInput): string => {
  const bits: string[] = ['is:pr'];
  if (i.state) bits.push(`is:${i.state}`);
  if (i.keywords?.trim()) bits.push(`"${i.keywords.trim()}"`);
  if (i.repo) bits.push(`repo:${i.repo}`);
  if (i.user) bits.push(`user:${i.user}`);
  if (i.author) bits.push(`author:${i.author}`);
  if (i.assignee) bits.push(`assignee:${i.assignee}`);
  if (i.label) bits.push(`label:"${i.label}"`);
  if (i.reviewRequested) bits.push(`review-requested:${i.reviewRequested}`);
  if (i.draft) bits.push('draft:true');
  if (i.created) bits.push(`created:${i.created}`);
  if (i.sort) bits.push(`sort:${i.sort}`);
  return bits.join(' · ');
};

const summarizeUsers = (i: UsersInput): string => {
  const bits: string[] = [];
  if (i.keywords?.trim()) bits.push(`"${i.keywords.trim()}"`);
  if (i.location) bits.push(`location:"${i.location}"`);
  if (i.language) bits.push(`language:${i.language}`);
  if (i.followers) bits.push(`followers:${i.followers}`);
  if (i.repos) bits.push(`repos:${i.repos}`);
  if (i.type) bits.push(`type:${i.type}`);
  return bits.join(' · ');
};

export const summarizeSearch = (s: SearchInput): string => {
  switch (s.type) {
    case 'repositories':
      return summarizeRepositories(s.input);
    case 'code':
      return summarizeCode(s.input);
    case 'issues':
      return summarizeIssues(s.input);
    case 'pullrequests':
      return summarizePullRequests(s.input);
    case 'users':
      return summarizeUsers(s.input);
    case 'special':
      try {
        const u = new URL(s.url);
        return `direct: ${u.hostname}${u.pathname}${u.search}`;
      } catch {
        return `direct: ${s.url}`;
      }
  }
};
