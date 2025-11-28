import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Home, ArrowLeft, Grid3x3, BookOpen, Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation/Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
            404
          </h1>
          <div className="mt-4 h-2 w-32 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Page Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t worry, let&apos;s get you back on track!
            </p>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link href="/">
            <Button className="w-full h-auto py-4 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Home className="h-5 w-5" />
              <span className="font-semibold">Go to Homepage</span>
            </Button>
          </Link>
          <Link href="/tools">
            <Button variant="outline" className="w-full h-auto py-4 gap-2 border-2 hover:bg-blue-50 dark:hover:bg-slate-800">
              <Grid3x3 className="h-5 w-5" />
              <span className="font-semibold">Browse Tools</span>
            </Button>
          </Link>
          <Link href="/blog">
            <Button variant="outline" className="w-full h-auto py-4 gap-2 border-2 hover:bg-blue-50 dark:hover:bg-slate-800">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold">Read Blog</span>
            </Button>
          </Link>
          <Link href="/categories">
            <Button variant="outline" className="w-full h-auto py-4 gap-2 border-2 hover:bg-blue-50 dark:hover:bg-slate-800">
              <Wrench className="h-5 w-5" />
              <span className="font-semibold">Categories</span>
            </Button>
          </Link>
        </div>

        {/* Search Suggestion */}
        <Card className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Try searching for what you need:
            </p>
            <Link href="/tools">
              <Button variant="ghost" className="w-full gap-2 hover:bg-blue-100 dark:hover:bg-slate-700">
                <Search className="h-4 w-4" />
                <span>Search AI Tools</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Help Text */}
        <p className="mt-8 text-xs text-slate-500 dark:text-slate-400">
          If you believe this is an error, please{" "}
          <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

