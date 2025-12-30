export const RECENT_AC_SUBMISSIONS_QUERY = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
      statusDisplay
      lang
      runtime
      url
      isPending
      memory
    }
  }
`;

export const SUBMISSION_DETAILS_QUERY = `
  query submissionDetails($submissionId: Int!) {
    submissionDetails(submissionId: $submissionId) {
      code
      runtime
      memory
      timestamp
      lang {
        name
        verboseName
      }
      question {
        questionId
        titleSlug
      }
      topicTags {
        name
        slug
      }
      runtimeDisplay
      memoryDisplay
      totalCorrect
      totalTestcases
      runtimePercentile
      memoryPercentile
    }
  }
`;

export interface RecentAcSubmissionDTO {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
  runtime: string;
  url: string;
  isPending: string;
  memory: string;
}

export interface SubmissionDetailsDTO {
  code: string;
  runtime: number;
  memory: number;
  timestamp: number;
  lang: {
    name: string;
    verboseName: string;
  };
  question: {
    questionId: string;
    titleSlug: string;
  };
  topicTags?: Array<{ name: string; slug: string }>;
  runtimeDisplay: string;
  memoryDisplay: string;
  totalCorrect: number;
  totalTestcases: number;
  runtimePercentile: number;
  memoryPercentile: number;
}
