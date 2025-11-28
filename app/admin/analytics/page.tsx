"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Eye, DollarSign, Loader2 } from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  totalViews: number;
  viewsGrowth: number;
  activeUsers: number;
  usersGrowth: number;
  revenue: number;
  revenueGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  topTools: Array<{
    name: string;
    slug: string;
    views: number;
    rating: number;
  }>;
}

export default function AnalyticsPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/analytics");
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Platform performance metrics</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Platform performance metrics</p>
        </div>
        <Card className="border-2 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? "+" : "";
    return `${sign}${growth.toFixed(1)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Platform performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold mt-1">{analytics.totalViews.toLocaleString()}</p>
                <p className={`text-xs mt-1 ${analytics.viewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatGrowth(analytics.viewsGrowth)} this month
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold mt-1">{analytics.activeUsers.toLocaleString()}</p>
                <p className={`text-xs mt-1 ${analytics.usersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatGrowth(analytics.usersGrowth)} this week
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold mt-1">${analytics.revenue.toLocaleString()}</p>
                <p className={`text-xs mt-1 ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatGrowth(analytics.revenueGrowth)} this month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold mt-1">{analytics.conversionRate.toFixed(1)}%</p>
                <p className={`text-xs mt-1 ${analytics.conversionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatGrowth(analytics.conversionGrowth)} this month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg mb-4">Top Performing Tools</h3>
          {analytics.topTools.length > 0 ? (
          <div className="space-y-4">
              {analytics.topTools.map((tool) => (
                <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                  <div className="flex items-center justify-between border-b pb-3 hover:bg-muted/50 p-2 rounded transition-colors cursor-pointer">
                <div>
                  <h4 className="font-semibold">{tool.name}</h4>
                  <p className="text-sm text-muted-foreground">{tool.views.toLocaleString()} views</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                        <span className="font-bold">{tool.rating.toFixed(1)}</span>
                    <span className="text-yellow-500">⭐</span>
                  </div>
                </div>
              </div>
                </Link>
            ))}
          </div>
          ) : (
            <p className="text-muted-foreground">No tools data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

