import { handleAuthError, withAuthErrorHandling, isAuthError } from "./error-handler";

export interface ApiCallOptions {
  maxRetries?: number;
  timeout?: number;
  onRetry?: (attempt: number) => void;
  onAuthError?: () => void;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public url: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiCall<T = any>(
  url: string,
  options: RequestInit & ApiCallOptions = {}
): Promise<T> {
  const {
    maxRetries = 2,
    timeout = 30000,
    onRetry,
    onAuthError,
    ...fetchOptions
  } = options;

  return withAuthErrorHandling(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new ApiError(
            `HTTP ${response.status}: ${errorText}`,
            response.status,
            response.statusText,
            url
          );
        }

        // Handle empty responses
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        } else {
          return await response.text();
        }
      } catch (error: any) {
        clearTimeout(timeoutId);

        // Re-throw network errors and API errors
        if (error.name === "AbortError") {
          throw new Error("Request timeout");
        }

        throw error;
      }
    },
    {
      maxRetries,
      onAuthError: () => {
        if (onAuthError) {
          onAuthError();
        } else {
          // Default behavior: redirect will be handled by handleAuthError
        }
      },
      onRetry: (attempt) => {
        console.log(`Retrying API call to ${url} (attempt ${attempt})`);
        if (onRetry) {
          onRetry(attempt);
        }
      }
    }
  );
}

// Convenience methods for common HTTP methods
export const api = {
  get: <T = any>(url: string, options?: ApiCallOptions) =>
    apiCall<T>(url, { ...options, method: "GET" }),

  post: <T = any>(url: string, data?: any, options?: ApiCallOptions) =>
    apiCall<T>(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(url: string, data?: any, options?: ApiCallOptions) =>
    apiCall<T>(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(url: string, options?: ApiCallOptions) =>
    apiCall<T>(url, { ...options, method: "DELETE" }),

  patch: <T = any>(url: string, data?: any, options?: ApiCallOptions) =>
    apiCall<T>(url, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    }),
};
