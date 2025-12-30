import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

import { gqlRequest } from "@/lib/leetcode/client";
import { logger } from "@/lib/core/logger";
import {
  RECENT_AC_SUBMISSIONS_QUERY,
  SUBMISSION_DETAILS_QUERY,
  RecentAcSubmissionDTO,
  SubmissionDetailsDTO,
} from "@/lib/leetcode/queries";

export async function getRecentAcSubmissions(
  username: string
): Promise<RecentAcSubmissionDTO[]> {
  const res = await gqlRequest<
    { recentAcSubmissionList: RecentAcSubmissionDTO[] },
    { username: string; limit: number }
  >(
    RECENT_AC_SUBMISSIONS_QUERY,
    { username, limit: 15 },
    "LeetCode.recentAcSubmissions"
  );

  return res.recentAcSubmissionList ?? [];
}

export async function getSubmissionDetails(
  submissionId: string
): Promise<SubmissionDetailsDTO> {
  const submissionIdNum = parseInt(submissionId, 10);
  if (isNaN(submissionIdNum)) {
    throw new Error(`Invalid submission ID: ${submissionId}`);
  }

  try {
    const res = await gqlRequest<
      { submissionDetails: SubmissionDetailsDTO | null },
      { submissionId: number }
    >(
      SUBMISSION_DETAILS_QUERY,
      { submissionId: submissionIdNum },
      "LeetCode.submissionDetails"
    );

    logger.info("Submission details response", {
      submissionId,
      hasSubmissionDetails: !!res?.submissionDetails,
      responseKeys: res ? Object.keys(res) : [],
      responseData: res ? JSON.stringify(res).substring(0, 200) : null,
    });

    if (!res || !res.submissionDetails) {
      // Check if cookies are configured
      const { env } = await import("@/lib/core/env");
      const hasCookies = !!(env.LEETCODE_SESSION && env.LEETCODE_CSRFTOKEN);

      // Log more details about why it failed
      let errorMsg = res
        ? `Submission details is null for submissionId: ${submissionId}.`
        : `No response received for submissionId: ${submissionId}`;

      if (!hasCookies) {
        errorMsg +=
          " Cookies not configured. Please add LEETCODE_SESSION and LEETCODE_CSRFTOKEN to .env.local";
      } else {
        errorMsg +=
          " This usually means: 1) Submission doesn't exist, 2) No permission to access this submission, or 3) Cookies expired.";
      }

      logger.error("Submission not found", {
        submissionId,
        hasResponse: !!res,
        hasCookies,
        responseData: res,
      });
      throw new Error(errorMsg);
    }

    return res.submissionDetails;
  } catch (error) {
    logger.error("Failed to get submission details", {
      submissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
