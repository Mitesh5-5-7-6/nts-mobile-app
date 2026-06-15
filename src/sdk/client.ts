import { create } from "axios";
import { ApiError } from "../lib/api-error";
import type { ApiResponseEnvelope } from "../types/api";

export const apiClient = create({
  baseURL: process.env.EXPO_API_BASE_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

/**
 * Unwraps the standard API response envelope, exposing just `.data`.
 * If success is false, throws an ApiError.
 */
export function unwrap<T>(response: ApiResponseEnvelope<T>): T {
  if (!response.success) {
    throw new ApiError(
      response.message || "Request failed",
      response.error?.code ?? "API_ERROR",
      response.error?.details,
    );
  }
  return response.data;
}
