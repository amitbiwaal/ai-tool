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

  // Fetch all stats
  const [
    toolsCount,
    categoriesCount,
    usersCount,
    reviewsCount,
    pendingToolsCount,
    approvedToolsCount,
    viewsResult,
    paymentsResult,
  ] = await Promise.all([
    supabase.from("tools").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("tools").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("tools").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("tools").select("views_count"),
    supabase.from("payments").select("amount").eq("payment_status", "completed"),
  ]);

  // Calculate total views
  const totalViews = viewsResult.data?.reduce((sum, tool) => {
    const views = Number(tool.views_count) || 0;
    return sum + views;
  }, 0) || 0;

  // Calculate revenue
  const revenue = paymentsResult.data?.reduce((sum, payment) => {
    const amount = Number(payment.amount) || 0;
    return sum + amount;
  }, 0) || 0;

  // Calculate approval rate
  const approvedCount = Number(approvedToolsCount.count) || 0;
  const pendingCount = Number(pendingToolsCount.count) || 0;
  const totalProcessed = approvedCount + pendingCount;
  const approvalRate = totalProcessed > 0 
    ? Math.round((approvedCount / totalProcessed) * 100) 
    : 0;

  return NextResponse.json({
    totalTools: Number(toolsCount.count) || 0,
    totalCategories: Number(categoriesCount.count) || 0,
    totalUsers: Number(usersCount.count) || 0,
    totalReviews: Number(reviewsCount.count) || 0,
    totalViews: Number(totalViews) || 0,
    revenue: Math.round(Number(revenue)) || 0,
    approvalRate: Number(approvalRate) || 0,
    pendingSubmissions: Number(pendingToolsCount.count) || 0,
  });
}

