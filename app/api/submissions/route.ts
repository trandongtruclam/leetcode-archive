import { NextRequest, NextResponse } from "next/server";
import { submissionRepo } from "@/lib/submissions/submission-repo";
import { logger } from "@/lib/core/logger";

export async function GET(req: NextRequest) {
  try {
    // Debug: Check if findMany exists
    if (typeof submissionRepo.findMany !== "function") {
      logger.error("submissionRepo.findMany is not a function", {
        submissionRepoKeys: Object.keys(submissionRepo),
        submissionRepoType: typeof submissionRepo,
      });
      throw new Error("submissionRepo.findMany is not a function");
    }

    const searchParams = req.nextUrl.searchParams;

    const username = searchParams.get("username") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const lang = searchParams.get("lang") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 20;

    const result = await submissionRepo.findMany({
      username,
      difficulty,
      lang,
      search,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("GET /api/submissions failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch submissions",
      },
      { status: 500 }
    );
  }
}
