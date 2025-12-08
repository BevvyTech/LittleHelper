import { type FastifyError, type FastifyReply, type FastifyRequest } from 'fastify';
import { AppError, ErrorCodes } from '@littlehelper/shared';

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
): void {
  if (error instanceof AppError) {
    void reply.status(error.statusCode).send({
      error: error.toJSON(),
    });
    return;
  }

  // Fastify validation errors
  if (error.validation) {
    const details: Record<string, string> = {};
    for (const err of error.validation) {
      const field = err.instancePath.replace(/^\//, '') || 'body';
      details[field] = err.message ?? 'Invalid value';
    }
    void reply.status(400).send({
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Validation failed',
        details,
      },
    });
    return;
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  void reply.status(500).send({
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    },
  });
}
