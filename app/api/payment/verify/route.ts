import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import crypto from "crypto";

// Note: Razorpay is not needed in verify route, only crypto for signature verification

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
    
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification data" },
        { status: 400 }
      );
    }

    // Get Razorpay keys
    const { keySecret } = await getRazorpayKeys(supabase);

    if (!keySecret) {
      return NextResponse.json(
        { error: "Payment gateway not configured. Please configure Razorpay keys in admin settings." },
        { status: 500 }
      );
    }

    // Check if this payment has already been processed (idempotency check)
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .or(`payment_provider_id.eq.${razorpay_payment_id},transaction_id.eq.${razorpay_payment_id}`)
      .single();

    // If payment already exists and is completed, return success (idempotent)
    if (existingPayment && existingPayment.payment_status === "completed") {
      return NextResponse.json({
        success: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        status: "completed",
        message: "Payment already processed",
      });
    }

    // If payment exists but is not completed, check if it's the same order
    if (existingPayment && existingPayment.payment_status !== "completed") {
      // Check if this is the same order
      if (existingPayment.payment_provider_id === razorpay_order_id || 
          existingPayment.transaction_id === razorpay_order_id) {
        // Same order, proceed with update
      } else {
        return NextResponse.json(
          { error: "Payment ID already used for a different order" },
          { status: 400 }
        );
      }
    }

    // Verify the payment signature
    const secret = keySecret;
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    const isSignatureValid = generated_signature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Find the payment record by order_id (razorpay_order_id)
    const { data: orderPayment } = await supabase
      .from("payments")
      .select("*")
      .or(`payment_provider_id.eq.${razorpay_order_id},transaction_id.eq.${razorpay_order_id}`)
      .single();

    if (!orderPayment) {
      return NextResponse.json(
        { error: "Payment order not found. Please create a new payment." },
        { status: 404 }
      );
    }

    // Check if payment is already completed
    if (orderPayment.payment_status === "completed") {
      return NextResponse.json({
        success: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        status: "completed",
        message: "Payment already processed",
      });
    }

    // Update payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({
        payment_status: "completed",
        payment_provider_id: razorpay_payment_id,
        transaction_id: razorpay_payment_id, // Store as transaction_id for uniqueness
        metadata: {
          ...(orderPayment.metadata || {}),
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          verified_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderPayment.id)
      .select()
      .single();

    if (paymentError) {
      console.error("Payment update error:", paymentError);
      return NextResponse.json(
        { error: "Failed to update payment record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      status: "completed",
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}

