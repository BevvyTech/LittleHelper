export const ErrorCodes = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, string>;
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: Record<string, string>,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}

export function createValidationError(details: Record<string, string>): AppError {
  return new AppError(ErrorCodes.VALIDATION_ERROR, 'Validation failed', details, 400);
}

export function createNotFoundError(resource: string): AppError {
  return new AppError(ErrorCodes.NOT_FOUND, `${resource} not found`, undefined, 404);
}

export function createAuthRequiredError(): AppError {
  return new AppError(ErrorCodes.AUTH_REQUIRED, 'Authentication required', undefined, 401);
}

export function createForbiddenError(): AppError {
  return new AppError(ErrorCodes.AUTH_FORBIDDEN, 'Access denied', undefined, 403);
}

export function createConflictError(message: string): AppError {
  return new AppError(ErrorCodes.CONFLICT, message, undefined, 409);
}

export function createRateLimitError(): AppError {
  return new AppError(ErrorCodes.RATE_LIMITED, 'Rate limit exceeded', undefined, 429);
}

export function createExternalServiceError(service: string, message: string): AppError {
  return new AppError(
    ErrorCodes.EXTERNAL_SERVICE_ERROR,
    `${service} error: ${message}`,
    undefined,
    502
  );
}
