import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendNewsletterToolUpdate, sendUserSpecificToolUpdate } from "@/lib/email-service";

// Function to trigger email notifications for tool updates
async function triggerToolUpdateNotifications(updatedTool: any, changes: any) {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      console.error("Cannot send notifications: Supabase not available");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mostpopularaitools.com";

    // Prepare tool data for email templates
    const toolData = {
      id: updatedTool.id,
      name: updatedTool.name,
      slug: updatedTool.slug,
      tagline: updatedTool.tagline,
      description: updatedTool.description,
      pricing_type: updatedTool.pricing_type,
      status: updatedTool.status,
      updated_at: updatedTool.updated_at,
    };

    // Option 1: Send newsletter notifications
    console.log("Sending newsletter notifications for tool update...");
    const newsletterResult = await sendNewsletterToolUpdate(toolData, baseUrl);
    console.log(`Newsletter notifications: ${newsletterResult.success} sent, ${newsletterResult.failed} failed`);

    // Option 2: Send user-specific notifications
    console.log("Getting user-specific notification recipients...");
    const { data: recipients, error: recipientsError } = await supabase
      .rpc('get_tool_notification_recipients', { p_tool_id: updatedTool.id });

    if (!recipientsError && recipients && recipients.length > 0) {
      console.log(`Found ${recipients.length} users to notify`);

      // Group recipients by notification reason
      const favoriteUsers = recipients
        .filter(r => r.notification_reason === 'favorite')
        .map(r => r.email);

      const visitedUsers = recipients
        .filter(r => r.notification_reason === 'visited')
        .map(r => r.email);

      // Send notifications to favorite users
      if (favoriteUsers.length > 0) {
        console.log(`Sending favorite notifications to ${favoriteUsers.length} users...`);
        const favoriteResult = await sendUserSpecificToolUpdate(toolData, favoriteUsers, 'favorite', baseUrl);
        console.log(`Favorite notifications: ${favoriteResult.success} sent, ${favoriteResult.failed} failed`);
      }

      // Send notifications to recently visited users
      if (visitedUsers.length > 0) {
        console.log(`Sending visited notifications to ${visitedUsers.length} users...`);
        const visitedResult = await sendUserSpecificToolUpdate(toolData, visitedUsers, 'visited', baseUrl);
        console.log(`Visited notifications: ${visitedResult.success} sent, ${visitedResult.failed} failed`);
      }
    } else {
      console.log("No user-specific notification recipients found");
    }

    console.log("Tool update notifications completed");
  } catch (error) {
    console.error("Error in triggerToolUpdateNotifications:", error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createServerSupabaseClient();
  
  if (!supabase) {
    return NextResponse.json({ 
      error: "Database connection not available. Please configure Supabase environment variables." 
    }, { status: 503 });
  }

  // Next.js 15: params is always a Promise
  const { slug } = await params;

  const { data, error } = await supabase
    .from("tools")
    .select(
      `
      *,
      categories:tool_categories(category:categories(*)),
      tags:tool_tags(tag:tags(*))
    `
    )
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  // ✅ Increment view count and get updated data
  const newViewsCount = (data.views_count || 0) + 1;
  const { data: updatedData, error: updateError } = await supabase
    .from("tools")
    .update({ views_count: newViewsCount })
    .eq("id", data.id)
    .select(
      `
      *,
      categories:tool_categories(category:categories(*)),
      tags:tool_tags(tag:tags(*))
      `
    )
    .single();

  // If update fails, log but continue with original data
  if (updateError) {
    console.error("Error updating view count:", updateError);
  }

  // Track user interaction (view) for personalized notifications
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Use the RPC function to track interaction
      await supabase.rpc('track_tool_interaction', {
        p_user_id: user.id,
        p_tool_id: data.id,
        p_interaction_type: 'view'
      });
    }
  } catch (interactionError) {
    console.error("Error tracking user interaction:", interactionError);
    // Don't fail the request if tracking fails
  }

  // Use updated data if available, otherwise use original data with incremented count
  const toolData = updatedData || { ...data, views_count: newViewsCount };

  const tool = {
    ...toolData,
    categories: toolData.categories?.map((c: any) => c.category) || [],
    tags: toolData.tags?.map((t: any) => t.tag) || [],
  };

  return NextResponse.json({ tool });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Handle both sync and async params (Next.js 13+ compatibility)
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Tool slug is required" }, { status: 400 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or moderator
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ error: "Failed to verify user role" }, { status: 500 });
    }

    // Only admin/moderator can edit tools
    if (profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden: Admin or moderator access required" }, { status: 403 });
    }

    // Get the tool
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("id")
      .eq("slug", slug)
      .single();

    if (toolError || !tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, tagline, description, pricing_type, status } = body;

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (description !== undefined) updateData.description = description;
    if (pricing_type !== undefined) updateData.pricing_type = pricing_type;
    if (status !== undefined) updateData.status = status;

    // Update the tool
    const { data: updatedTool, error: updateError } = await supabase
      .from("tools")
      .update(updateData)
      .eq("id", tool.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update tool error:", updateError);
      return NextResponse.json({
        error: updateError.message || "Failed to update tool",
        details: updateError.details || null
      }, { status: 500 });
    }

    // Trigger email notifications asynchronously (don't block the response)
    setImmediate(async () => {
      try {
        await triggerToolUpdateNotifications(updatedTool, updateData);
      } catch (notificationError) {
        console.error("Failed to send tool update notifications:", notificationError);
        // Don't fail the main request if notifications fail
      }
    });

    return NextResponse.json({
      tool: updatedTool,
      message: "Tool updated successfully"
    });
  } catch (error: any) {
    console.error("Unexpected error in PUT tools route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Handle both sync and async params (Next.js 13+ compatibility)
    const { slug } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First, get the tool to check ownership
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("id, submitted_by")
      .eq("slug", slug)
      .single();

    if (toolError || !tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    // Check if user owns the tool or is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (tool.submitted_by !== user.id && profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the tool
    const { error: deleteError } = await supabase
      .from("tools")
      .delete()
      .eq("id", tool.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Unexpected error in DELETE tools route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

