export class ValidationSkippedError extends Error {}

export function isValidationSkippedError(error: unknown): error is ValidationSkippedError {
  return error instanceof ValidationSkippedError
}