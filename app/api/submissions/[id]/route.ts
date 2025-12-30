import { NextRequest, NextResponse } from "next/server";
import { submissionRepo } from "@/lib/submissions/submission-repo";
import { logger } from "@/lib/core/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const submission = await submissionRepo.findById(resolvedParams.id);

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission not found",
        },
        { status: 404 }
      );
    }

    // Convert BigInt to string for JSON serialization
    const serializedSubmission = {
      ...submission,
      memory: submission.memory ? submission.memory.toString() : null,
    };

    return NextResponse.json({
      success: true,
      data: serializedSubmission,
    });
  } catch (error) {
    logger.error("GET /api/submissions/[id] failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch submission",
      },
      { status: 500 }
    );
  }
}
