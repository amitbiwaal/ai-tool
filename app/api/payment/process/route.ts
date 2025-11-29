import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import crypto from "crypto";

// Helper function to get Razorpay keys (from env vars or database)
async function getRazorpayKeys(supabase: any) {
  // First try environment variables (preferred for security)
  let keyId = process.env.RAZORPAY_KEY_ID;
  let keySecret = process.env.RAZORPAY_KEY_SECRET;

  // If not in env vars, try to get from database settings
  if (!keyId || !keySecret) {
    try {
      const { data: settings } = await supabase
        .from("settings")
        .select("value")
        .eq("category", "payment")
        .in("key", ["razorpayKeyId", "razorpayKeySecret"]);

      if (settings && settings.length === 2) {
        const keyIdSetting = settings.find((s: any) => s.key === "razorpayKeyId");
        const keySecretSetting = settings.find((s: any) => s.key === "razorpayKeySecret");
        
        if (keyIdSetting && keySecretSetting) {
          keyId = keyIdSetting.value;
          keySecret = keySecretSetting.value;
        }
      }
    } catch (error) {
      console.error("Error fetching Razorpay keys from database:", error);
    }
  }

  return { keyId, keySecret };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      );
    }
    
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, tool_submission_id } = body;

    // Validation
    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // Check if user has a recent pending payment (within last 5 minutes) to prevent duplicate orders
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentPayment } = await supabase
      .from("payments")
      .select("id, payment_status, created_at")
      .eq("user_id", user.id)
      .eq("payment_status", "pending")
      .gte("created_at", fiveMinutesAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (recentPayment) {
      return NextResponse.json(
        { 
          error: "You have a pending payment. Please complete or cancel it before creating a new one.",
          existing_order_id: recentPayment.id 
        },
        { status: 400 }
      );
    }

    // If tool_submission_id is provided, check if payment already exists for this submission
    if (tool_submission_id) {
      const { data: existingSubmissionPayment } = await supabase
        .from("payments")
        .select("id, payment_status")
        .eq("tool_id", tool_submission_id)
        .eq("user_id", user.id)
        .in("payment_status", ["pending", "completed"])
        .single();

      if (existingSubmissionPayment) {
        if (existingSubmissionPayment.payment_status === "completed") {
          return NextResponse.json(
            { 
              error: "Payment already completed for this submission",
              payment_id: existingSubmissionPayment.id 
            },
            { status: 400 }
          );
        } else {
          return NextResponse.json(
            { 
              error: "Payment already in progress for this submission",
              payment_id: existingSubmissionPayment.id 
            },
            { status: 400 }
          );
        }
      }
    }

    // Get Razorpay keys
    const { keyId, keySecret } = await getRazorpayKeys(supabase);

    // Check if Razorpay is configured
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment gateway not configured. Please configure Razorpay keys in admin settings." },
        { status: 500 }
      );
    }

    // Dynamic import for Razorpay (CommonJS module)
    let Razorpay;
    try {
      const razorpayModule = await import("razorpay");
      Razorpay = razorpayModule.default || razorpayModule;
    } catch (importError: any) {
      console.error("Failed to import Razorpay:", importError);
      return NextResponse.json(
        { 
          error: "Payment gateway module not available. Please install razorpay package: npm install razorpay",
          details: importError.message 
        },
        { status: 500 }
      );
    }
    
    // Initialize Razorpay with the keys
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Convert amount from paise to rupees (Razorpay uses smallest currency unit)
    // Amount is in paise (e.g., 9900 paise = ₹99)
    const amountInPaise = Math.round(amount);

    // Create Razorpay order
    // Receipt must be max 40 characters
    const timestamp = Date.now().toString().slice(-10); // Last 10 digits
    const userIdShort = user.id.split('-')[0]; // First part of UUID
    const receipt = `RCP_${timestamp}_${userIdShort}`.slice(0, 40); // Max 40 chars
    
    const options = {
      amount: amountInPaise, // Amount in paise
      currency: "INR",
      receipt: receipt,
      notes: {
        user_id: user.id,
        purpose: "AI Tool Listing Payment",
      },
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
      console.log("✅ Razorpay order created:", order.id);
    } catch (razorpayError: any) {
      console.error("Razorpay order creation error:", razorpayError);
      return NextResponse.json(
        { 
          error: razorpayError.error?.description || razorpayError.message || "Failed to create payment order",
          details: razorpayError.error || razorpayError,
          code: razorpayError.error?.code
        },
        { status: 500 }
      );
    }

    // Store pending payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        tool_id: tool_submission_id || null,
        amount: amount,
        currency: "INR",
        payment_method: "card",
        payment_provider: "razorpay",
        payment_provider_id: order.id, // Store Razorpay order_id
        transaction_id: order.id, // Also store as transaction_id for uniqueness
        payment_status: "pending",
        listing_type: "paid",
        metadata: {
          razorpay_order_id: order.id,
          amount_in_paise: amountInPaise,
          purpose: "AI Tool Listing Payment",
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment record error:", paymentError);
      // If database insert fails, we should still return the order
      // but log the error for manual tracking
      // The payment can still be verified later using order_id
      console.warn("⚠️ Payment order created but database record failed. Order ID:", order.id);
      // Continue to return order_id so payment can proceed
      // Admin can manually track this payment using order_id
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (error: any) {
    console.error("Payment processing error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // Provide more specific error messages
    let errorMessage = "Payment processing failed";
    let errorDetails = null;
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    if (error.error) {
      errorDetails = error.error;
      if (error.error.description) {
        errorMessage = error.error.description;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails || error,
        code: error.code || error.error?.code,
        hint: "Check server console for detailed error logs"
      },
      { status: 500 }
    );
  }
}

