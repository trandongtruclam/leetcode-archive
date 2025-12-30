export class AppError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code = 'INTERNAL_ERROR', statusCode = 500) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class LeetCodeAPIError extends AppError {
  constructor(message: string, statusCode = 502) {
    super(message, 'LEETCODE_API_ERROR', statusCode)
    this.name = 'LeetCodeAPIError'
  }
}
