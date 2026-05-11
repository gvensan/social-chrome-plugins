export type SearchType = 'posts' | 'jobs' | 'people';

export type RecencyPreset =
  | '15min'
  | '30min'
  | '1h'
  | '24h'
  | 'week'
  | 'month'
  | 'any';

export const RECENCY_SECONDS: Record<Exclude<RecencyPreset, 'any'>, number> = {
  '15min': 900,
  '30min': 1800,
  '1h': 3600,
  '24h': 86400,
  week: 604800,
  month: 2592000,
};

export type ContentDatePosted = 'past-24h' | 'past-week' | 'past-month' | 'any';
export type ContentSort = 'date_posted' | 'relevance';
export type PostedBy = 'me' | 'first' | 'following';
/** LinkedIn `contentType` values for the Posts → Content type pill.
 *  All plural — verified empirically against URLs LinkedIn's UI
 *  generates when the filter is applied via the dropdown. */
export type ContentType = 'videos' | 'photos' | 'documents';

export interface PostsInput {
  keywords?: string;
  sort?: ContentSort;
  datePosted?: ContentDatePosted;
  postedBy?: PostedBy[];
  /**
   * Numeric LinkedIn organization (company) IDs whose own page posted
   * the content. Emitted as `fromOrganization=["<id>"]`.
   *
   * Beta — this URL parameter is inferred from observing LinkedIn's
   * "All filters" panel and is not officially documented. May break
   * without notice.
   */
  fromOrganizationIds?: string[];
  /** Company labels to OR into the keywords field as a fallback when
   *  the saved company is slug-only (no ID). Used by both
   *  fromOrganization and mentionsCompany branches. */
  companyKeywords?: string[];
  /** Numeric LinkedIn company IDs that the post @-mentions as an entity
   *  (different from `fromOrganization`, which is the post's author).
   *  Emitted as `mentionsOrganization=["<id>"]`. Verified empirically. */
  mentionsCompanyIds?: string[];
  /** Profile tokens (`ACoAA…`) of people the post @-mentions.
   *  Emitted as `mentionsMember=["<token>"]`. Verified empirically. */
  mentionsMemberTokens?: string[];
  /**
   * LinkedIn profile tokens (`ACoAA…` opaque base64url strings) whose
   * own posts to filter to. Emitted as `fromMember=["<token>"]`.
   *
   * Why tokens: LinkedIn's faceted search switched away from the legacy
   * `urn:li:fsd_member:<numeric>` form — that shape is now silently
   * dropped server-side, returning zero results. The profile token is
   * the value LinkedIn's UI sends today (verified empirically).
   *
   * Beta — same risk class as `fromOrganization`; not documented
   * publicly by LinkedIn.
   */
  fromMemberTokens?: string[];
  /** Person labels (full names or vanities) to OR into the keywords
   *  field as a fallback when the saved person is vanity-only. */
  personKeywords?: string[];
  /** Single-select content-type filter — Videos / Images / Documents.
   *  Emitted as `contentType=["<value>"]` (verified empirically against
   *  URLs LinkedIn's UI generates from the dropdown). */
  contentType?: ContentType;
}

export type JobsSort = 'DD' | 'R';
export type WorkplaceType = 1 | 2 | 3;
export type ExperienceLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type JobType = 'F' | 'P' | 'C' | 'T' | 'I' | 'V' | 'O';
/** LinkedIn job-function abbreviation codes — values for the `f_F`
 *  URL filter. The full enum is large (~30 entries); see
 *  `JOB_FUNCTION_OPTIONS` in `lib/params.ts` for the curated set we
 *  expose. Typed as `string` to keep the URL builder permissive. */
export type JobFunction = string;

export interface JobsInput {
  keywords?: string;
  location?: string;
  geoId?: string;
  recency?: RecencyPreset;
  sort?: JobsSort;
  workplaceTypes?: WorkplaceType[];
  experienceLevels?: ExperienceLevel[];
  jobTypes?: JobType[];
  /** Job function codes — emitted as `f_F=<csv>` (e.g. `eng,it`). */
  jobFunctions?: JobFunction[];
  easyApply?: boolean;
  /** Toggles the "Under 10 applicants" filter — emitted as `f_AL=true`.
   *  (LinkedIn's URL param name is historical; the UI label is
   *  "Under 10 applicants".) */
  underTenApplicants?: boolean;
  /** Toggles the "Has verifications" filter — emitted as `f_VJ=true`. */
  hasVerifications?: boolean;
  inYourNetwork?: boolean;
  /** Numeric LinkedIn company IDs — emitted as `f_C=<csv>`. */
  companyIds?: string[];
  /** Company labels to OR into the keywords field as a fallback for
   *  slug-only saved companies (or to widen recall when an ID is set). */
  companyKeywords?: string[];
}

export type NetworkDegree = 'F' | 'S' | 'O';

export interface PeopleInput {
  keywords?: string;
  network?: NetworkDegree[];
  titleFreeText?: string;
  currentCompanyIds?: string[];
  pastCompanyIds?: string[];
  /**
   * Company-name labels to OR into the keywords field as a fallback
   * filter for companies the user saved by slug only (no LinkedIn ID
   * available). Less precise than `currentCompanyIds` — matches any
   * profile mention, not verified employment — but works without the
   * ID-capture dance. Keyword fallback collapses the current/past
   * distinction; both arrays merge into the same keywords expression.
   */
  currentCompanyKeywords?: string[];
  pastCompanyKeywords?: string[];
  /** Numeric LinkedIn industry IDs (filters people by their company's
   *  industry). Emitted as `industryCompany=["<id>"]`. Beta —
   *  parameter inferred from observing LinkedIn's "All filters" panel. */
  industryIds?: string[];
}

export type SearchInput =
  | { type: 'posts'; input: PostsInput }
  | { type: 'jobs'; input: JobsInput }
  | { type: 'people'; input: PeopleInput };

export const emptyInputFor = (type: SearchType): SearchInput => {
  switch (type) {
    case 'posts':
      return { type: 'posts', input: {} };
    case 'jobs':
      return { type: 'jobs', input: {} };
    case 'people':
      return { type: 'people', input: {} };
  }
};
