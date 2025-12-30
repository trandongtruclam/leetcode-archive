import { GraphQLClient } from "graphql-request";
import { logger } from "@/lib/core/logger";
import { LeetCodeAPIError } from "@/lib/core/errors";
import { env } from "@/lib/core/env";

const ENDPOINT =
  process.env.LEETCODE_GRAPHQL_ENDPOINT || "https://leetcode.com/graphql";

// Build cookies string if available
function buildCookies(): string | undefined {
  const cookies: string[] = [];
  if (env.LEETCODE_SESSION) {
    cookies.push(`LEETCODE_SESSION=${env.LEETCODE_SESSION}`);
  }
  if (env.LEETCODE_CSRFTOKEN) {
    cookies.push(`csrftoken=${env.LEETCODE_CSRFTOKEN}`);
  }
  return cookies.length > 0 ? cookies.join("; ") : undefined;
}

const cookies = buildCookies();
const headers: Record<string, string> = {
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Origin: "https://leetcode.com",
  Referer: "https://leetcode.com",
};

if (cookies) {
  headers["Cookie"] = cookies;
  if (env.LEETCODE_CSRFTOKEN) {
    headers["X-CSRFToken"] = env.LEETCODE_CSRFTOKEN;
  }
  logger.info("LeetCode cookies configured", {
    hasSession: !!env.LEETCODE_SESSION,
    hasCsrfToken: !!env.LEETCODE_CSRFTOKEN,
  });
} else {
  logger.warn("LeetCode cookies NOT configured - submissionDetails will fail", {
    hasSession: !!env.LEETCODE_SESSION,
    hasCsrfToken: !!env.LEETCODE_CSRFTOKEN,
  });
}

const client = new GraphQLClient(ENDPOINT, {
  headers,
});

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const MAX_RETRIES = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn(`${label} failed`, {
        attempt,
        error: error instanceof Error ? error.message : String(error),
      });
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
      }
    }
  }

  throw new LeetCodeAPIError(
    `${label} failed after retries: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
    502
  );
}

export async function gqlRequest<TResponse, TVariables extends object>(
  query: string,
  variables: TVariables,
  label: string
): Promise<TResponse> {
  return withRetry(async () => {
    try {
      const response = await client.request<TResponse>(query, variables);
      logger.info(`${label} succeeded`, {
        variables,
        hasResponse: !!response,
        responseKeys: response ? Object.keys(response) : [],
      });
      return response;
    } catch (error: any) {
      // Log the actual error response if available
      if (error?.response) {
        logger.error(`${label} GraphQL error`, {
          variables,
          errors: error.response.errors,
          data: error.response.data,
        });
      }
      throw error;
    }
  }, label);
}
