import { Skeleton } from "@/components/ui/skeleton";

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16 sm:pt-24 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <Skeleton className="h-6 w-32 mx-auto mb-6" />

            {/* Title */}
            <Skeleton className="h-12 sm:h-16 lg:h-20 w-full max-w-4xl mx-auto mb-6" />

            {/* Description */}
            <Skeleton className="h-6 w-full max-w-2xl mx-auto mb-8" />

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-44" />
            </div>

            {/* Stats */}
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>

          {/* Category cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section Skeleton */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-80 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-full max-w-32 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
