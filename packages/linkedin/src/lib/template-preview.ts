import type {
  JobsInput,
  PeopleInput,
  PostsInput,
  SearchInput,
} from './url-builder';

const RECENCY_LABEL: Record<string, string> = {
  '15min': 'past 15 min',
  '30min': 'past 30 min',
  '1h': 'past hour',
  '24h': 'past 24h',
  week: 'past week',
  month: 'past month',
  any: 'any time',
};

const POSTS_DATE_LABEL: Record<string, string> = {
  'past-24h': 'past 24h',
  'past-week': 'past week',
  'past-month': 'past month',
  any: 'any time',
};

const NETWORK_LABEL: Record<string, string> = {
  F: '1st',
  S: '2nd',
  O: '3rd+',
};

const POSTED_BY_LABEL: Record<string, string> = {
  me: 'me',
  first: '1st-degree',
  following: 'people I follow',
};

const WORKPLACE_LABEL: Record<number, string> = {
  1: 'on-site',
  2: 'hybrid',
  3: 'remote',
};

const summarizePosts = (i: PostsInput): string => {
  const bits: string[] = [];
  if (i.keywords?.trim()) bits.push(`keywords: "${i.keywords.trim()}"`);
  if (i.datePosted && i.datePosted !== 'any') {
    bits.push(POSTS_DATE_LABEL[i.datePosted] ?? i.datePosted);
  }
  if (i.sort === 'date_posted') bits.push('latest');
  else if (i.sort === 'relevance') bits.push('relevance');
  if (i.postedBy?.length) {
    bits.push(
      `from ${i.postedBy.map((p) => POSTED_BY_LABEL[p] ?? p).join(' + ')}`
    );
  }
  if (i.fromOrganizationIds?.length) bits.push('from a company');
  if (i.fromMemberTokens?.length) bits.push('from a person');
  if (i.mentionsCompanyIds?.length) bits.push('mentions a company');
  if (i.mentionsMemberTokens?.length) bits.push('mentions a person');
  if (i.contentType) {
    const label = i.contentType === 'photos' ? 'images' : i.contentType;
    bits.push(`type: ${label}`);
  }
  if (i.companyKeywords?.length || i.personKeywords?.length) {
    bits.push('keyword fallback set');
  }
  return bits.join(' · ');
};

const summarizeJobs = (i: JobsInput): string => {
  const bits: string[] = [];
  if (i.keywords?.trim()) bits.push(`keywords: "${i.keywords.trim()}"`);
  if (i.location?.trim()) bits.push(`location: ${i.location.trim()}`);
  if (i.recency && i.recency !== 'any') {
    bits.push(RECENCY_LABEL[i.recency] ?? i.recency);
  }
  if (i.sort === 'DD') bits.push('latest');
  if (i.workplaceTypes?.length) {
    bits.push(i.workplaceTypes.map((w) => WORKPLACE_LABEL[w] ?? `wp:${w}`).join(' / '));
  }
  if (i.easyApply) bits.push('Easy Apply');
  if (i.underTenApplicants) bits.push('under 10 applicants');
  if (i.hasVerifications) bits.push('has verifications');
  if (i.jobFunctions?.length) {
    bits.push(`function: ${i.jobFunctions.join(' / ')}`);
  }
  if (i.inYourNetwork) bits.push('in your network');
  if (i.companyIds?.length) bits.push('at a saved company');
  return bits.join(' · ');
};

const summarizePeople = (i: PeopleInput): string => {
  const bits: string[] = [];
  if (i.titleFreeText?.trim()) bits.push(`title: ${i.titleFreeText.trim()}`);
  if (i.keywords?.trim()) bits.push(`keywords: "${i.keywords.trim()}"`);
  if (i.network?.length) {
    bits.push(
      `network: ${i.network.map((n) => NETWORK_LABEL[n] ?? n).join(' + ')}`
    );
  }
  if (i.currentCompanyIds?.length || i.currentCompanyKeywords?.length) {
    bits.push('current: saved company');
  }
  if (i.pastCompanyIds?.length || i.pastCompanyKeywords?.length) {
    bits.push('past: saved company');
  }
  return bits.join(' · ');
};

/**
 * One-line human-readable summary of what a template will set in the
 * URL. Rendered on each template card so the user knows what filters
 * the Open button will apply before they click.
 */
export const summarizeSearch = (s: SearchInput): string => {
  switch (s.type) {
    case 'posts':
      return summarizePosts(s.input);
    case 'jobs':
      return summarizeJobs(s.input);
    case 'people':
      return summarizePeople(s.input);
  }
};
