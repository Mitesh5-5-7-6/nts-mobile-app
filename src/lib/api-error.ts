import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  success: false;
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export class ApiError extends Error {
  success: false = false;
  code: string;
  details?: Record<string, string[]>;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Transforms an Axios or unknown error into a standard ApiErrorResponse shape
 */
export function handleApiError(error: unknown): ApiErrorResponse {
  if (error instanceof ApiError) {
    return {
      success: false,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<any>;
    const responseData = axiosError.response?.data;

    // Check if the server already returned a standard envelopes error response
    if (responseData && responseData.success === false && responseData.error) {
      return {
        success: false,
        code: responseData.error.code || 'API_ERROR',
        message: responseData.message || axiosError.message,
        details: responseData.error.details,
      };
    }

    // Default axios error conversions
    const statusCode = axiosError.response?.status;
    let code = 'NETWORK_ERROR';
    let message = axiosError.message || 'Network request failed';

    if (statusCode) {
      if (statusCode === 400) code = 'BAD_REQUEST';
      else if (statusCode === 401) code = 'UNAUTHORIZED';
      else if (statusCode === 403) code = 'FORBIDDEN';
      else if (statusCode === 404) code = 'NOT_FOUND';
      else if (statusCode === 409) code = 'CONFLICT';
      else if (statusCode === 422) code = 'VALIDATION_ERROR';
      else if (statusCode === 429) code = 'RATE_LIMIT_EXCEEDED';
      else if (statusCode >= 500) {
        code = 'INTERNAL_SERVER_ERROR';
        message = 'Internal server error. Please try again later.';
      }
    }

    return {
      success: false,
      code,
      message,
      details: responseData?.error?.details,
    };
  }

  // Fallback for regular JavaScript Error or unknown
  const err = error as Error;
  return {
    success: false,
    code: 'UNKNOWN_ERROR',
    message: err?.message || 'An unexpected error occurred',
  };
}
