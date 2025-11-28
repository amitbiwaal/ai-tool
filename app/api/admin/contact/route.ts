import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Check authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
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

    if (profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden: Admin or moderator access required" }, { status: 403 });
    }

    console.log("User authorized, fetching contact messages...");

    // Fetch all contact messages
    const { data: messages, error: messagesError } = await supabase
      .from("contact_messages")
      .select(`
        id,
        name,
        email,
        subject,
        message,
        reason,
        status,
        replied_by,
        replied_at,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (messagesError) {
      console.error("Contact messages fetch error:", messagesError);
      return NextResponse.json({ 
        error: messagesError.message || "Failed to fetch contact messages",
        details: messagesError
      }, { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    if (!messages || messages.length === 0) {
      console.log("No contact messages found in database");
      return NextResponse.json({ 
        messages: [],
        message: "No contact messages found"
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    console.log(`✅ Fetched ${messages.length} contact messages from database`);

    // Transform messages data
    const transformedMessages = messages.map((msg) => ({
      id: msg.id,
      name: msg.name,
      email: msg.email,
      subject: msg.subject || "",
      message: msg.message,
      website: null, // Not in schema, can be added if needed
      status: (msg.status === "new" ? "unread" : msg.status) as "unread" | "read" | "replied",
      created_at: msg.created_at,
    }));

    return NextResponse.json({ 
      messages: transformedMessages || [],
      count: transformedMessages?.length || 0
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error("Unexpected error in GET contact route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Check authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
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

    if (profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden: Admin or moderator access required" }, { status: 403 });
    }

    const body = await request.json();
    const { messageId, status } = body;

    if (!messageId || !status) {
      return NextResponse.json({ error: "Message ID and status are required" }, { status: 400 });
    }

    // Validate status
    if (!["new", "read", "replied", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update message status
    const updateData: any = {
      status: status === "unread" ? "new" : status,
      updated_at: new Date().toISOString(),
    };

    // If marking as replied, set replied_by and replied_at
    if (status === "replied") {
      updateData.replied_by = user.id;
      updateData.replied_at = new Date().toISOString();
    }

    const { data: updatedMessage, error: updateError } = await supabase
      .from("contact_messages")
      .update(updateData)
      .eq("id", messageId)
      .select()
      .single();

    if (updateError) {
      console.error("Update message error:", updateError);
      return NextResponse.json({ 
        error: updateError.message || "Failed to update message status",
        details: updateError.details || null
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: updatedMessage,
      success: true
    });
  } catch (error: any) {
    console.error("Unexpected error in PUT contact route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    // Check authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
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

    if (profile?.role !== "admin" && profile?.role !== "moderator") {
      return NextResponse.json({ error: "Forbidden: Admin or moderator access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    // Delete message
    const { error: deleteError } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", messageId);

    if (deleteError) {
      console.error("Delete message error:", deleteError);
      return NextResponse.json({ 
        error: deleteError.message || "Failed to delete message"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error: any) {
    console.error("Unexpected error in DELETE contact route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

