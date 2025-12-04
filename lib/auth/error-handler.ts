import { toast } from "sonner";
import { sessionManager } from "./session-manager";

export interface AuthError {
  message?: string;
  status?: number;
  code?: string;
}

export const isAuthError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message || error.error_description || String(error);
  const lowerMessage = errorMessage.toLowerCase();

  return (
    lowerMessage.includes('refresh_token_not_found') ||
    lowerMessage.includes('invalid refresh token') ||
    lowerMessage.includes('jwt expired') ||
    lowerMessage.includes('token has expired') ||
    lowerMessage.includes('invalid_grant') ||
    lowerMessage.includes('session not found')
  );
};

export const handleAuthError = (error: AuthError, redirectToLogin: boolean = true): boolean => {
  if (!isAuthError(error)) {
    return false; // Not an auth error, let other handlers deal with it
  }

  console.warn("Auth error detected:", error);

  // Stop session monitoring
  sessionManager.stopSessionMonitoring();

  // Clear all stored auth data
  try {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();

      // Clear any auth-related cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
  } catch (clearError) {
    console.error("Error clearing auth data:", clearError);
  }

  // Show user-friendly notification
  toast.error("Your session has expired. Please sign in again.", {
    duration: 5000,
    description: "You will be redirected to the login page."
  });

  // Redirect to login after a short delay to allow toast to show
  if (redirectToLogin && typeof window !== 'undefined') {
    setTimeout(() => {
      window.location.href = '/auth/login?error=session_expired';
    }, 2000);
  }

  return true; // Auth error was handled
};

export const withAuthErrorHandling = async <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    onAuthError?: () => void;
    onRetry?: (attempt: number) => void;
  } = {}
): Promise<T> => {
  const { maxRetries = 1, onAuthError, onRetry } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      console.error(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);

      // Check if it's an auth error
      if (isAuthError(error)) {
        if (onAuthError) {
          onAuthError();
        } else {
          handleAuthError(error);
        }
        throw error; // Re-throw after handling
      }

      // If not the last attempt and not an auth error, retry
      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt);
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Last attempt failed, re-throw
      throw error;
    }
  }

  throw new Error("Unexpected error in withAuthErrorHandling");
};
