import type {
  ContentDatePosted,
  ContentSort,
  ContentType,
  ExperienceLevel,
  JobFunction,
  JobType,
  JobsSort,
  NetworkDegree,
  PostedBy,
  RecencyPreset,
  WorkplaceType,
} from './url-builder/types';

export interface Option<T> {
  value: T;
  label: string;
}

export const RECENCY_OPTIONS: ReadonlyArray<Option<RecencyPreset>> = [
  { value: '15min', label: 'Past 15 minutes' },
  { value: '30min', label: 'Past 30 minutes' },
  { value: '1h', label: 'Past hour' },
  { value: '24h', label: 'Past 24 hours' },
  { value: 'week', label: 'Past week' },
  { value: 'month', label: 'Past month' },
  { value: 'any', label: 'Any time' },
];

export const CONTENT_DATE_OPTIONS: ReadonlyArray<Option<ContentDatePosted>> = [
  { value: 'past-24h', label: 'Past 24 hours' },
  { value: 'past-week', label: 'Past week' },
  { value: 'past-month', label: 'Past month' },
  { value: 'any', label: 'Any time' },
];

export const CONTENT_SORT_OPTIONS: ReadonlyArray<Option<ContentSort>> = [
  { value: 'date_posted', label: 'Latest' },
  { value: 'relevance', label: 'Relevance' },
];

export const POSTED_BY_OPTIONS: ReadonlyArray<Option<PostedBy>> = [
  { value: 'me', label: 'Me' },
  { value: 'first', label: '1st-degree connections' },
  { value: 'following', label: 'People I follow' },
];

export const CONTENT_TYPE_OPTIONS: ReadonlyArray<Option<ContentType>> = [
  { value: 'videos', label: 'Videos' },
  { value: 'photos', label: 'Images' },
  { value: 'documents', label: 'Documents' },
];

export const JOBS_SORT_OPTIONS: ReadonlyArray<Option<JobsSort>> = [
  { value: 'DD', label: 'Latest' },
  { value: 'R', label: 'Most relevant' },
];

export const WORKPLACE_OPTIONS: ReadonlyArray<Option<WorkplaceType>> = [
  { value: 1, label: 'On-site' },
  { value: 2, label: 'Hybrid' },
  { value: 3, label: 'Remote' },
];

export const EXPERIENCE_OPTIONS: ReadonlyArray<Option<ExperienceLevel>> = [
  { value: 1, label: 'Internship' },
  { value: 2, label: 'Entry level' },
  { value: 3, label: 'Associate' },
  { value: 4, label: 'Mid-Senior' },
  { value: 5, label: 'Director' },
  { value: 6, label: 'Executive' },
];

export const JOB_TYPE_OPTIONS: ReadonlyArray<Option<JobType>> = [
  { value: 'F', label: 'Full-time' },
  { value: 'P', label: 'Part-time' },
  { value: 'C', label: 'Contract' },
  { value: 'T', label: 'Temporary' },
  { value: 'I', label: 'Internship' },
  { value: 'V', label: 'Volunteer' },
  { value: 'O', label: 'Other' },
];

/**
 * LinkedIn job-function abbreviations — values for the `f_F` URL filter.
 * The list mirrors LinkedIn's "Job function" dropdown in the All filters
 * panel; abbreviations are LinkedIn's own (verified empirically — e.g.
 * "Information Technology" sends `it`, "Business Development" sends `bd`).
 */
export const JOB_FUNCTION_OPTIONS: ReadonlyArray<Option<JobFunction>> = [
  { value: 'acct', label: 'Accounting/Auditing' },
  { value: 'adm', label: 'Administrative' },
  { value: 'advr', label: 'Advertising' },
  { value: 'anls', label: 'Analyst' },
  { value: 'art', label: 'Art/Creative' },
  { value: 'bd', label: 'Business Development' },
  { value: 'cnsl', label: 'Consulting' },
  { value: 'cust', label: 'Customer Service' },
  { value: 'dist', label: 'Distribution' },
  { value: 'dsgn', label: 'Design' },
  { value: 'educ', label: 'Education' },
  { value: 'eng', label: 'Engineering' },
  { value: 'fin', label: 'Finance' },
  { value: 'glmt', label: 'General Business' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'hcpr', label: 'Health Care Provider' },
  { value: 'it', label: 'Information Technology' },
  { value: 'lgl', label: 'Legal' },
  { value: 'mnfc', label: 'Manufacturing' },
  { value: 'mkt', label: 'Marketing' },
  { value: 'mgmt', label: 'Management' },
  { value: 'othr', label: 'Other' },
  { value: 'prod', label: 'Product Management' },
  { value: 'prjm', label: 'Project Management' },
  { value: 'pr', label: 'Public Relations' },
  { value: 'prch', label: 'Purchasing' },
  { value: 'qlty', label: 'Quality Assurance' },
  { value: 'rsch', label: 'Research' },
  { value: 'sale', label: 'Sales' },
  { value: 'sci', label: 'Science' },
  { value: 'strt', label: 'Strategy/Planning' },
  { value: 'supl', label: 'Supply Chain' },
  { value: 'trng', label: 'Training' },
  { value: 'wrt', label: 'Writing/Editing' },
];

export const NETWORK_OPTIONS: ReadonlyArray<Option<NetworkDegree>> = [
  { value: 'F', label: '1st-degree' },
  { value: 'S', label: '2nd-degree' },
  { value: 'O', label: '3rd+ / out-of-network' },
];

/**
 * Curated subset of LinkedIn's industry IDs — the 50 most-used buckets,
 * stable since at least 2018. The full list has ~150 entries (every
 * industry LinkedIn lets a company self-report); these cover the vast
 * majority of People searches. IDs are LinkedIn's numeric industry
 * codes; emitted in URLs as `industryCompany=["<id>"]`.
 *
 * Add more IDs here as needed — they're stable and public (visible in
 * every company-page URL when the industry filter is applied).
 */
export const INDUSTRY_OPTIONS: ReadonlyArray<Option<string>> = [
  { value: '4', label: 'Computer Software' },
  { value: '6', label: 'Internet' },
  { value: '96', label: 'Information Technology and Services' },
  { value: '3', label: 'Computer Hardware' },
  { value: '5', label: 'Computer Networking' },
  { value: '109', label: 'Computer & Network Security' },
  { value: '118', label: 'Computer Games' },
  { value: '1810', label: 'Software Development' },
  { value: '1813', label: 'IT Services and IT Consulting' },
  { value: '1855', label: 'Technology, Information and Internet' },
  { value: '43', label: 'Financial Services' },
  { value: '41', label: 'Banking' },
  { value: '47', label: 'Investment Banking' },
  { value: '45', label: 'Capital Markets' },
  { value: '46', label: 'Insurance' },
  { value: '129', label: 'Venture Capital & Private Equity' },
  { value: '14', label: 'Hospital & Health Care' },
  { value: '13', label: 'Health, Wellness and Fitness' },
  { value: '15', label: 'Pharmaceuticals' },
  { value: '12', label: 'Biotechnology' },
  { value: '11', label: 'Medical Devices' },
  { value: '17', label: 'Higher Education' },
  { value: '69', label: 'Education Management' },
  { value: '67', label: 'E-Learning' },
  { value: '132', label: 'Research' },
  { value: '32', label: 'Marketing and Advertising' },
  { value: '79', label: 'Public Relations and Communications' },
  { value: '80', label: 'Online Media' },
  { value: '70', label: 'Entertainment' },
  { value: '37', label: 'Broadcast Media' },
  { value: '99', label: 'Newspapers' },
  { value: '35', label: 'Media Production' },
  { value: '53', label: 'Management Consulting' },
  { value: '104', label: 'Human Resources' },
  { value: '137', label: 'Staffing and Recruiting' },
  { value: '92', label: 'Legal Services' },
  { value: '128', label: 'Accounting' },
  { value: '102', label: 'Real Estate' },
  { value: '50', label: 'Construction' },
  { value: '51', label: 'Architecture & Planning' },
  { value: '23', label: 'Mechanical or Industrial Engineering' },
  { value: '52', label: 'Civil Engineering' },
  { value: '7', label: 'Semiconductors' },
  { value: '20', label: 'Aviation & Aerospace' },
  { value: '54', label: 'Automotive' },
  { value: '34', label: 'Retail' },
  { value: '27', label: 'Consumer Goods' },
  { value: '19', label: 'Apparel & Fashion' },
  { value: '111', label: 'Government Administration' },
  { value: '100', label: 'Non-profit Organization Management' },
];
