"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="max-w-2xl w-full text-center">
            <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong!
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              {error.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

