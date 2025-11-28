import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Database connection not available. Please configure Supabase." },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    tagline,
    description,
    long_description,
    logo_url,
    cover_image_url,
    website_url,
    pricing_type,
    pricing_details,
    features,
    pros,
    cons,
    screenshots,
    video_url,
    categories,
    tags,
    listing_type,
    payment_id,
    payment_status,
  } = body;

  // Validation
  if (!name || !description || !website_url || !pricing_type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate payment for paid listings
  if (listing_type === "paid" && !payment_id) {
    return NextResponse.json(
      { error: "Payment required for paid listings" },
      { status: 400 }
    );
  }

  // If payment_id is provided, verify it exists and hasn't been used for another tool
  if (payment_id) {
    const { data: paymentRecord, error: paymentCheckError } = await supabase
      .from("payments")
      .select("id, payment_status, tool_id, user_id")
      .or(`payment_provider_id.eq.${payment_id},transaction_id.eq.${payment_id}`)
      .single();

    if (paymentCheckError || !paymentRecord) {
      return NextResponse.json(
        { error: "Invalid payment ID. Payment not found." },
        { status: 400 }
      );
    }

    // Check if payment belongs to the current user
    if (paymentRecord.user_id !== user.id) {
      return NextResponse.json(
        { error: "Payment does not belong to you" },
        { status: 403 }
      );
    }

    // Check if payment is completed
    if (paymentRecord.payment_status !== "completed") {
      return NextResponse.json(
        { error: "Payment is not completed. Please complete the payment first." },
        { status: 400 }
      );
    }

    // Check if payment has already been used for another tool
    if (paymentRecord.tool_id && paymentRecord.tool_id !== null) {
      const { data: existingTool } = await supabase
        .from("tools")
        .select("id, name")
        .eq("id", paymentRecord.tool_id)
        .single();

      if (existingTool) {
        return NextResponse.json(
          { 
            error: `This payment has already been used for tool: ${existingTool.name}. Each payment can only be used once.`,
            used_for_tool: existingTool.name
          },
          { status: 400 }
        );
      }
    }
  }

  const slug = slugify(name);

  try {
    // Check if slug already exists
    const { data: existingTool, error: checkError } = await supabase
      .from("tools")
      .select("id")
      .eq("slug", slug)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned (expected when slug doesn't exist)
      console.error("Error checking existing tool:", checkError);
      return NextResponse.json(
        { error: `Database error: ${checkError.message}. Please ensure the 'tools' table exists in your Supabase database.` },
        { status: 500 }
      );
    }

    if (existingTool) {
      return NextResponse.json(
        { error: "A tool with this name already exists" },
        { status: 400 }
      );
    }

    // Insert tool
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .insert({
        name,
        slug,
        tagline,
        description,
        long_description,
        logo_url,
        cover_image_url,
        website_url,
        pricing_type,
        pricing_details,
        features,
        pros,
        cons,
        screenshots,
        video_url,
        submitted_by: user.id,
        status: "pending", // Requires approval
        listing_type: listing_type || "free",
        payment_id: payment_id || null,
        payment_status: payment_status || null,
      })
      .select()
      .single();

    if (toolError) {
      console.error("Error inserting tool:", toolError);
      let errorMessage = toolError.message;
      
      if (toolError.message?.includes("schema cache") || toolError.message?.includes("Could not find the table")) {
        errorMessage = "The 'tools' table does not exist in your database. Please create the table in Supabase first.";
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // If payment_id exists, update the payment record to link it with this tool
    // This prevents the same payment from being used for multiple tools
    if (payment_id && tool) {
      const { error: paymentUpdateError } = await supabase
        .from("payments")
        .update({
          tool_id: tool.id,
          updated_at: new Date().toISOString(),
        })
        .or(`payment_provider_id.eq.${payment_id},transaction_id.eq.${payment_id}`);

      if (paymentUpdateError) {
        console.error("Error updating payment with tool_id:", paymentUpdateError);
        // Don't fail the tool submission if payment update fails
        // The payment is already completed, tool submission should succeed
      }
    }

    // Insert categories
    if (categories && categories.length > 0) {
      const categoryInserts = categories.map((categoryId: string) => ({
        tool_id: tool.id,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase.from("tool_categories").insert(categoryInserts);
      
      if (categoryError) {
        console.error("Error inserting categories:", categoryError);
        // Don't fail the request if category insert fails, just log it
      }
    }

    // Insert tags
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tagId: string) => ({
        tool_id: tool.id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase.from("tool_tags").insert(tagInserts);
      
      if (tagError) {
        console.error("Error inserting tags:", tagError);
        // Don't fail the request if tag insert fails, just log it
      }
    }

    // Create submission record
    const { error: submissionError } = await supabase.from("submissions").insert({
      tool_id: tool.id,
      submitted_by: user.id,
      status: "pending",
    });

    if (submissionError) {
      console.error("Error creating submission record:", submissionError);
      // Don't fail the request if submission record fails, just log it
    }

    return NextResponse.json({ tool }, { status: 201 });
  } catch (error: any) {
    console.error("Unexpected error in submit route:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

