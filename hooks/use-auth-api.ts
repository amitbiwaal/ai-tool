import { useCallback } from "react";
import { api, ApiCallOptions, ApiError } from "@/lib/auth/api-wrapper";
import { handleAuthError } from "@/lib/auth/error-handler";
import { toast } from "sonner";

interface UseAuthApiOptions extends ApiCallOptions {
  showErrorToast?: boolean;
  errorMessage?: string;
}

export function useAuthApi() {
  const makeRequest = useCallback(async <T = any>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    data?: any,
    options: UseAuthApiOptions = {}
  ): Promise<T | null> => {
    const {
      showErrorToast = true,
      errorMessage = "An error occurred",
      onAuthError,
      ...apiOptions
    } = options;

    try {
      switch (method) {
        case 'get':
          return await api.get<T>(url, apiOptions);
        case 'post':
          return await api.post<T>(url, data, apiOptions);
        case 'put':
          return await api.put<T>(url, data, apiOptions);
        case 'delete':
          return await api.delete<T>(url, apiOptions);
        case 'patch':
          return await api.patch<T>(url, data, apiOptions);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    } catch (error: any) {
      console.error(`API ${method.toUpperCase()} ${url} failed:`, error);

      // Handle auth errors
      if (handleAuthError(error)) {
        return null; // Auth error handled, return null
      }

      // Handle API errors
      if (error instanceof ApiError) {
        if (showErrorToast) {
          toast.error(errorMessage, {
            description: error.message,
            duration: 5000,
          });
        }
        throw error;
      }

      // Handle other errors
      if (showErrorToast) {
        toast.error(errorMessage, {
          description: error.message || "Unknown error occurred",
          duration: 5000,
        });
      }
      throw error;
    }
  }, []);

  // Convenience methods
  const get = useCallback(<T = any>(url: string, options?: UseAuthApiOptions) =>
    makeRequest<T>('get', url, undefined, options), [makeRequest]);

  const post = useCallback(<T = any>(url: string, data?: any, options?: UseAuthApiOptions) =>
    makeRequest<T>('post', url, data, options), [makeRequest]);

  const put = useCallback(<T = any>(url: string, data?: any, options?: UseAuthApiOptions) =>
    makeRequest<T>('put', url, data, options), [makeRequest]);

  const del = useCallback(<T = any>(url: string, options?: UseAuthApiOptions) =>
    makeRequest<T>('delete', url, undefined, options), [makeRequest]);

  const patch = useCallback(<T = any>(url: string, data?: any, options?: UseAuthApiOptions) =>
    makeRequest<T>('patch', url, data, options), [makeRequest]);

  return {
    get,
    post,
    put,
    delete: del,
    patch,
    makeRequest,
  };
}
