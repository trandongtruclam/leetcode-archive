import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchAndSaveSubmissions } from '@/lib/submissions/submission-service'
import { ValidationError, AppError } from '@/lib/core/errors'
import { logger } from '@/lib/core/logger'

const bodySchema = z.object({
  username: z.string().min(1).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const { username } = bodySchema.parse(json)

    const result = await fetchAndSaveSubmissions(username)

    return NextResponse.json(
      {
        success: true,
        results: result,
      },
      { status: 200 },
    )
  } catch (error) {
    logger.error('POST /api/submissions/fetch failed', {
      error: error instanceof Error ? error.message : String(error),
    })

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode },
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body', issues: error.issues },
        { status: 400 },
      )
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode },
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
