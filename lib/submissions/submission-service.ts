import { getRecentAcSubmissions, getSubmissionDetails } from "@/types";
import { submissionRepo } from "./submission-repo";
import { trackedUserRepo } from "./tracked-user-repo";
import { logger } from "@/lib/core/logger";
import { ValidationError } from "@/lib/core/errors";

export interface FetchResult {
  saved: number;
  skipped: number;
  errors: number;
  errorDetails: Array<{ submissionId: string; error: string }>;
}

export async function fetchAndSaveSubmissions(
  rawUsername: string
): Promise<FetchResult> {
  const username = rawUsername.trim().toLowerCase();
  if (!username) {
    throw new ValidationError("Username is required");
  }

  let tracked = await trackedUserRepo.findByUsername(username);
  if (!tracked) {
    tracked = await trackedUserRepo.create(username);
    logger.info("Created tracked user", { username });
  }

  const recent = await getRecentAcSubmissions(username);

  const result: FetchResult = {
    saved: 0,
    skipped: 0,
    errors: 0,
    errorDetails: [],
  };

  for (const s of recent) {
    try {
      const existing = await submissionRepo.findByUsernameAndSubmissionId(
        username,
        s.id
      );
      if (existing) {
        result.skipped++;
        continue;
      }

      // Try to get submission details, but fallback to basic info if it fails
      let details: any = null;
      try {
        details = await getSubmissionDetails(s.id);
      } catch (detailsError) {
        const errorMsg =
          detailsError instanceof Error
            ? detailsError.message
            : String(detailsError);
        logger.warn(
          "Failed to get submission details, saving basic info only",
          {
            username,
            submissionId: s.id,
            error: errorMsg,
          }
        );

        // If cookies are not configured, save basic info without code
        if (
          errorMsg.includes("Cookies not configured") ||
          errorMsg.includes("Submission not found")
        ) {
          // Save with basic info from recentAcSubmissionList
          await submissionRepo.create({
            submissionId: s.id,
            username,
            title: s.title,
            slug: s.titleSlug,
            timestamp: parseInt(s.timestamp, 10),
            runtime: 0, // Not available without details
            runtimePercentile: null,
            runtimeDisplay: s.runtime || null,
            memory: null,
            memoryPercentile: null,
            memoryDisplay: s.memory || null,
            lang: s.lang,
            statusCode: 10, // Accepted
            code: "", // Empty - need cookies to get code
            difficulty: null,
            topics: [],
            questionId: null,
            totalCorrect: null,
            totalTestcases: null,
            trackedUserId: tracked.id,
          });
          result.saved++;
          continue;
        }
        // Re-throw if it's a different error
        throw detailsError;
      }

      // Save with full details
      await submissionRepo.create({
        submissionId: s.id,
        username,
        title: s.title,
        slug: details.question.titleSlug,
        timestamp: details.timestamp,
        runtime: details.runtime || 0,
        runtimePercentile: details.runtimePercentile ?? null,
        runtimeDisplay: details.runtimeDisplay ?? null,
        memory: details.memory ? BigInt(details.memory) : null,
        memoryPercentile: details.memoryPercentile ?? null,
        memoryDisplay: details.memoryDisplay ?? null,
        lang: details.lang.name,
        statusCode: 10, // Accepted
        code: details.code,
        difficulty: null, // Not available in submissionDetails response
        topics: details.topicTags?.map((t: { name: string }) => t.name) ?? [],
        questionId: details.question.questionId,
        totalCorrect: details.totalCorrect ?? null,
        totalTestcases: details.totalTestcases ?? null,
        trackedUserId: tracked.id,
      });

      result.saved++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors++;
      result.errorDetails.push({ submissionId: s.id, error: message });
      logger.error("Failed to process submission", {
        username,
        submissionId: s.id,
        error: message,
      });
    }
  }

  await trackedUserRepo.updateLastFetched(tracked.id);

  logger.info("Fetch and save completed", {
    username,
    ...result,
  });

  return result;
}
