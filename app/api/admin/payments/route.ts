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

    console.log("User authorized, fetching payments...");

    // Fetch all payments with user and tool details
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select(`
        id,
        tool_id,
        user_id,
        amount,
        currency,
        payment_method,
        payment_provider,
        payment_provider_id,
        payment_status,
        transaction_id,
        listing_type,
        metadata,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (paymentsError) {
      console.error("Payments fetch error:", paymentsError);
      return NextResponse.json({ 
        error: paymentsError.message || "Failed to fetch payments",
        details: paymentsError
      }, { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    if (!payments || payments.length === 0) {
      console.log("No payments found in database");
      return NextResponse.json({ 
        payments: [],
        message: "No payments found"
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    console.log(`✅ Fetched ${payments.length} payments from database`);

    // Fetch user and tool details for each payment
    const paymentsWithDetails = await Promise.all(
      payments.map(async (payment) => {
        // Fetch user details
        let userDetails = null;
        if (payment.user_id) {
          const { data: userData } = await supabase
            .from("profiles")
            .select("id, email, full_name, avatar_url")
            .eq("id", payment.user_id)
            .single();
          userDetails = userData;
        }

        // Fetch tool details
        let toolDetails = null;
        if (payment.tool_id) {
          const { data: toolData } = await supabase
            .from("tools")
            .select("id, name, slug")
            .eq("id", payment.tool_id)
            .single();
          toolDetails = toolData;
        }

        return {
          id: payment.id,
          payment_id: payment.transaction_id || payment.id,
          user_id: payment.user_id,
          user_name: userDetails?.full_name || userDetails?.email?.split("@")[0] || "Unknown User",
          user_email: userDetails?.email || "N/A",
          tool_id: payment.tool_id,
          tool_name: toolDetails?.name || "Unknown Tool",
          tool_slug: toolDetails?.slug || "",
          amount: Math.round(Number(payment.amount) * 100), // Convert to cents
          currency: payment.currency || "USD",
          status: payment.payment_status || "pending",
          payment_method: payment.payment_method || "card",
          created_at: payment.created_at,
          completed_at: payment.payment_status === "completed" ? payment.updated_at : null,
          listing_type: payment.listing_type || "paid",
        };
      })
    );

    console.log(`✅ Returning ${paymentsWithDetails.length} payments with details`);

    return NextResponse.json({ 
      payments: paymentsWithDetails || [],
      count: paymentsWithDetails?.length || 0
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error("Unexpected error in GET payments route:", error);
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
    const { paymentId, status, refundAmount, reason } = body;

    if (!paymentId || !status) {
      return NextResponse.json({ error: "Payment ID and status are required" }, { status: 400 });
    }

    // Validate status
    if (!["pending", "completed", "failed", "refunded"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // If refunding, validate refund amount
    if (status === "refunded") {
      // Get current payment
      const { data: currentPayment, error: fetchError } = await supabase
        .from("payments")
        .select("amount, payment_status")
        .eq("id", paymentId)
        .single();

      if (fetchError || !currentPayment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }

      if (currentPayment.payment_status !== "completed") {
        return NextResponse.json({ 
          error: "Only completed payments can be refunded" 
        }, { status: 400 });
      }

      if (!reason || !reason.trim()) {
        return NextResponse.json({ 
          error: "Refund reason is required" 
        }, { status: 400 });
      }
    }

    // Update payment status
    const updateData: any = {
      payment_status: status,
      updated_at: new Date().toISOString(),
    };

    // If refunding, add refund metadata
    if (status === "refunded") {
      updateData.metadata = {
        refund_amount: refundAmount || null,
        refund_reason: reason,
        refunded_by: user.id,
        refunded_at: new Date().toISOString(),
      };
    }

    const { data: updatedPayment, error: updateError } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", paymentId)
      .select()
      .single();

    if (updateError) {
      console.error("Update payment error:", updateError);
      return NextResponse.json({ 
        error: updateError.message || "Failed to update payment status",
        details: updateError
      }, { status: 500 });
    }

    console.log(`✅ Payment ${paymentId} status updated to ${status}`);

    return NextResponse.json({ 
      payment: updatedPayment,
      success: true,
      message: status === "refunded" ? "Refund processed successfully" : "Payment status updated successfully"
    });
  } catch (error: any) {
    console.error("Unexpected error in PUT payments route:", error);
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
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    // Check if payment exists
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("id, payment_status")
      .eq("id", paymentId)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Delete payment
    const { error: deleteError } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (deleteError) {
      console.error("Delete payment error:", deleteError);
      return NextResponse.json({ 
        error: deleteError.message || "Failed to delete payment"
      }, { status: 500 });
    }

    console.log(`✅ Payment ${paymentId} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: "Payment record deleted successfully",
    });
  } catch (error: any) {
    console.error("Unexpected error in DELETE payments route:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}

