"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function PaymentForm({ amount, onSuccess, onCancel, loading, setLoading }: PaymentFormProps) {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      toast.error("Failed to load payment gateway. Please refresh the page.");
    };
    document.body.appendChild(script);

    return () => {
      // Safe cleanup - check if script is still in DOM
      if (script.parentNode) {
      document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded || !window.Razorpay) {
      toast.error("Payment gateway is loading. Please wait...");
      return;
    }

    // Prevent multiple payment attempts
    if (loading) {
      toast.error("Payment is already in progress. Please wait...");
      return;
    }

    setLoading(true);

    try {
      // Create order on backend
      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment order");
      }

      if (!data.success || !data.order_id) {
        throw new Error("Failed to create payment order");
      }

      // Open Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "AI Tools Directory",
        description: "AI Tool Listing Payment",
        order_id: data.order_id,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            // Validate payment_id exists
            if (!verifyData.payment_id) {
              throw new Error("Payment ID not received from server. Please contact support.");
            }

            toast.success("Payment successful!");
            onSuccess(verifyData.payment_id);
          } catch (error: any) {
            console.error("Payment verification error:", error);
            toast.error(error.message || "Payment verification failed");
            setLoading(false);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description || "Unknown error"}`);
        setLoading(false);
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Amount Display */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 sm:p-6 rounded-lg border-2 border-primary/20">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Amount:</span>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              ₹{(amount / 100).toFixed(2)}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">per listing</div>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-[10px] sm:text-xs text-muted-foreground">
            <span>✓ Featured placement</span>
            <span>✓ Priority listing</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
          You will be redirected to Razorpay&apos;s secure payment gateway to complete your payment.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading || !razorpayLoaded}
          className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handlePayment}
          disabled={loading || !razorpayLoaded}
          className="flex-1 h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {loading ? (
            <>
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : !razorpayLoaded ? (
            <>
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Loading...
            </>
          ) : (
            <>
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Pay ₹{(amount / 100).toFixed(2)}
            </>
          )}
        </Button>
      </div>

      {/* Security Badge */}
      <div className="text-center pt-2">
        <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-1.5 sm:gap-2">
          <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          Secured by Razorpay • Your information is encrypted
        </p>
      </div>
    </div>
  );
}

