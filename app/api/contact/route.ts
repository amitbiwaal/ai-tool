import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        error: "Database connection not available. Please configure Supabase environment variables." 
      }, { status: 503 });
    }

    const body = await request.json();
    const { name, email, subject, message, website, reason } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json({ 
        error: "Name, email, and message are required" 
      }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: "Invalid email format" 
      }, { status: 400 });
    }

    // Insert contact message into database
    const { data: contactMessage, error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        name: name.trim(),
        email: email.trim(),
        subject: subject?.trim() || null,
        message: message.trim(),
        reason: reason || null,
        status: "new",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting contact message:", insertError);
      return NextResponse.json({ 
        error: insertError.message || "Failed to save message",
        details: insertError
      }, { status: 500 });
    }

    console.log("✅ Contact message saved:", contactMessage.id);

    return NextResponse.json({ 
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
      id: contactMessage.id
    }, { status: 201 });
  } catch (error: any) {
    console.error("Unexpected error in POST contact route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

