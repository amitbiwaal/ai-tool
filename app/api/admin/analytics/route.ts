import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ 
      error: "Database connection not available. Please configure Supabase environment variables." 
    }, { status: 503 });
  }

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get current date and previous month/week dates
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - 7);
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - 14);

  // Fetch all stats
  const [
    allToolsResult,
    thisMonthToolsResult,
    lastMonthToolsResult,
    allUsersResult,
    thisWeekUsersResult,
    lastWeekUsersResult,
    paymentsResult,
    thisMonthPaymentsResult,
    lastMonthPaymentsResult,
    topToolsResult,
  ] = await Promise.all([
    // Total views (all time)
    supabase.from("tools").select("views_count"),
    // Tools created this month (for growth calculation)
    supabase.from("tools").select("views_count").gte("created_at", thisMonthStart.toISOString()),
    // Tools created last month (for growth calculation)
    supabase.from("tools").select("views_count").gte("created_at", lastMonthStart.toISOString()).lte("created_at", lastMonthEnd.toISOString()),
    // All users
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    // Users created this week
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", thisWeekStart.toISOString()),
    // Users created last week
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", lastWeekStart.toISOString()).lte("created_at", thisWeekStart.toISOString()),
    // All revenue
    supabase.from("payments").select("amount").eq("payment_status", "completed"),
    // This month revenue
    supabase.from("payments").select("amount").eq("payment_status", "completed").gte("created_at", thisMonthStart.toISOString()),
    // Last month revenue
    supabase.from("payments").select("amount").eq("payment_status", "completed").gte("created_at", lastMonthStart.toISOString()).lte("created_at", lastMonthEnd.toISOString()),
    // Top performing tools
    supabase.from("tools").select("id, name, slug, views_count, rating_avg").eq("status", "approved").order("views_count", { ascending: false }).limit(10),
  ]);

  // Calculate total views
  const totalViews = allToolsResult.data?.reduce((sum, tool) => {
    const views = Number(tool.views_count) || 0;
    return sum + views;
  }, 0) || 0;

  // Calculate views growth based on average views per tool created this month vs last month
  const thisMonthToolsCount = thisMonthToolsResult.data?.length || 0;
  const lastMonthToolsCount = lastMonthToolsResult.data?.length || 0;
  
  // Calculate average views for tools created this month
  const thisMonthAvgViews = thisMonthToolsCount > 0
    ? (thisMonthToolsResult.data?.reduce((sum, tool) => sum + (Number(tool.views_count) || 0), 0) || 0) / thisMonthToolsCount
    : 0;
  
  // Calculate average views for tools created last month
  const lastMonthAvgViews = lastMonthToolsCount > 0
    ? (lastMonthToolsResult.data?.reduce((sum, tool) => sum + (Number(tool.views_count) || 0), 0) || 0) / lastMonthToolsCount
    : 0;

  // Calculate views growth based on tool creation rate and average views
  const viewsGrowth = lastMonthAvgViews > 0 
    ? ((thisMonthAvgViews - lastMonthAvgViews) / lastMonthAvgViews) * 100 
    : (thisMonthToolsCount > lastMonthToolsCount ? 100 : 0);

  // Calculate active users (total users)
  const activeUsers = Number(allUsersResult.count) || 0;
  const thisWeekUsers = Number(thisWeekUsersResult.count) || 0;
  const lastWeekUsers = Number(lastWeekUsersResult.count) || 0;

  // Calculate users growth
  const usersGrowth = lastWeekUsers > 0 
    ? ((thisWeekUsers - lastWeekUsers) / lastWeekUsers) * 100 
    : 0;

  // Calculate revenue
  const revenue = paymentsResult.data?.reduce((sum, payment) => {
    const amount = Number(payment.amount) || 0;
    return sum + amount;
  }, 0) || 0;

  // Calculate this month revenue
  const thisMonthRevenue = thisMonthPaymentsResult.data?.reduce((sum, payment) => {
    const amount = Number(payment.amount) || 0;
    return sum + amount;
  }, 0) || 0;

  // Calculate last month revenue
  const lastMonthRevenue = lastMonthPaymentsResult.data?.reduce((sum, payment) => {
    const amount = Number(payment.amount) || 0;
    return sum + amount;
  }, 0) || 0;

  // Calculate revenue growth
  const revenueGrowth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // Calculate conversion rate (if we have payments and users)
  // Conversion = (users who made payments / total users) * 100
  const { data: usersWithPayments } = await supabase
    .from("payments")
    .select("user_id", { count: "exact" })
    .eq("payment_status", "completed");
  
  const uniquePayingUsers = new Set(usersWithPayments?.map(p => p.user_id) || []).size;
  const conversionRate = activeUsers > 0 
    ? (uniquePayingUsers / activeUsers) * 100 
    : 0;

  // Calculate conversion growth (simplified - compare this month vs last month)
  const { data: thisMonthPayingUsers } = await supabase
    .from("payments")
    .select("user_id")
    .eq("payment_status", "completed")
    .gte("created_at", thisMonthStart.toISOString());
  
  const { data: lastMonthPayingUsers } = await supabase
    .from("payments")
    .select("user_id")
    .eq("payment_status", "completed")
    .gte("created_at", lastMonthStart.toISOString())
    .lte("created_at", lastMonthEnd.toISOString());

  const thisMonthPayingCount = new Set(thisMonthPayingUsers?.map(p => p.user_id) || []).size;
  const lastMonthPayingCount = new Set(lastMonthPayingUsers?.map(p => p.user_id) || []).size;
  const conversionGrowth = lastMonthPayingCount > 0 
    ? ((thisMonthPayingCount - lastMonthPayingCount) / lastMonthPayingCount) * 100 
    : 0;

  // Format top performing tools
  const topTools = topToolsResult.data?.map(tool => ({
    name: tool.name,
    slug: tool.slug,
    views: Number(tool.views_count) || 0,
    rating: Number(tool.rating_avg) || 0,
  })) || [];

  return NextResponse.json({
    totalViews: Number(totalViews) || 0,
    viewsGrowth: Number(viewsGrowth.toFixed(1)) || 0,
    activeUsers: Number(activeUsers) || 0,
    usersGrowth: Number(usersGrowth.toFixed(1)) || 0,
    revenue: Math.round(Number(revenue)) || 0,
    revenueGrowth: Number(revenueGrowth.toFixed(1)) || 0,
    conversionRate: Number(conversionRate.toFixed(1)) || 0,
    conversionGrowth: Number(conversionGrowth.toFixed(1)) || 0,
    topTools: topTools,
  });
}

