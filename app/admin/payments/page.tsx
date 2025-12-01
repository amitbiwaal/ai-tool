"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Search, 
  Eye, 
  Download,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Calendar,
  User,
  Package,
  Filter,
  TrendingUp,
  X,
  AlertCircle
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Payment {
  id: string;
  payment_id: string;
  user_name: string;
  user_email: string;
  tool_name: string;
  tool_slug: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed" | "refunded";
  payment_method: string;
  created_at: string;
  completed_at?: string;
  listing_type: "free" | "paid";
}

export default function PaymentsManagementPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "failed" | "refunded">("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundData, setRefundData] = useState({
    refundType: "full" as "full" | "partial",
    refundAmount: "",
    reason: "",
  });

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/payments?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Fetched payments:", data.payments?.length || 0);
        setPayments(data.payments || []);
      } else {
        const error = await response.json();
        console.error("Failed to fetch payments:", error);
        toast.error(error.error || "Failed to load payments");
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Network error while fetching payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.tool_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.payment_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalRevenue: payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter((p) => p.status === "pending").length,
    completed: payments.filter((p) => p.status === "completed").length,
    failed: payments.filter((p) => p.status === "failed").length,
    refunded: payments.filter((p) => p.status === "refunded").length,
    totalTransactions: payments.length,
  };

  const handleRefund = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundData({
      refundType: "full",
      refundAmount: formatAmount(payment.amount, payment.currency).replace(/[^0-9.]/g, ""),
      reason: "",
    });
    setShowRefundModal(true);
  };

  const processRefund = async () => {
    if (!selectedPayment) return;

    // Validation
    if (!refundData.reason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }

    if (refundData.refundType === "partial") {
      const refundAmount = parseFloat(refundData.refundAmount);
      const maxAmount = selectedPayment.amount / 100;
      if (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > maxAmount) {
        toast.error(`Please enter a valid amount between $0.01 and $${maxAmount.toFixed(2)}`);
        return;
      }
    }

    setRefundLoading(true);

    try {
      const refundAmount = refundData.refundType === "full" 
        ? null 
        : parseFloat(refundData.refundAmount);

      const response = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          status: "refunded",
          refundAmount: refundAmount,
          reason: refundData.reason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update payment status in state
        setPayments(payments.map((p) => 
          p.id === selectedPayment.id ? { ...p, status: "refunded" as const } : p
        ));

        // Update selected payment if it's the same
        if (selectedPayment) {
          setSelectedPayment({ ...selectedPayment, status: "refunded" });
        }

        toast.success(
          `Refund of ${refundData.refundType === "full" ? formatAmount(selectedPayment.amount, selectedPayment.currency) : `$${refundData.refundAmount}`} processed successfully`
        );

        // Reset and close modal
        setShowRefundModal(false);
        setRefundData({
          refundType: "full",
          refundAmount: "",
          reason: "",
        });
      } else {
        toast.error(data.error || "Failed to process refund. Please try again.");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund. Please try again.");
    } finally {
      setRefundLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment record?")) {
      return;
    }

    setUpdating(id);
    try {
      const response = await fetch(`/api/admin/payments?paymentId=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setPayments(payments.filter((p) => p.id !== id));
        if (selectedPayment?.id === id) {
          setSelectedPayment(null);
        }
        toast.success("Payment record deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete payment record");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment record");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "refunded":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount / 100);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Payments Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage payment transactions and subscriptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchPayments}
            variant="outline"
            size="sm"
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {formatAmount(stats.totalRevenue, "USD")}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +12.5% this month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.completed}</p>
                <p className="text-xs text-muted-foreground mt-1">Successful payments</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold mt-1">{stats.totalTransactions}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.failed} failed, {stats.refunded} refunded
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, tool, or payment ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                onClick={() => setFilterStatus("completed")}
                size="sm"
              >
                Completed
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === "failed" ? "default" : "outline"}
                onClick={() => setFilterStatus("failed")}
                size="sm"
              >
                Failed
              </Button>
              <Button
                variant={filterStatus === "refunded" ? "default" : "outline"}
                onClick={() => setFilterStatus("refunded")}
                size="sm"
              >
                Refunded
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-muted-foreground">Loading payments...</p>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payments List */}
        <div className="lg:col-span-1 space-y-4">
          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => (
              <Card
                key={payment.id}
                className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
                  selectedPayment?.id === payment.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedPayment(payment)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm">{payment.tool_name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{payment.user_name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{payment.user_email}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg text-green-600">
                          {formatAmount(payment.amount, payment.currency)}
                        </span>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No payments found</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Detail */}
        <div className="lg:col-span-2">
          {selectedPayment ? (
            <Card className="border-2 sticky top-8">
              <CardHeader className="bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">Payment Details</CardTitle>
                      <Badge className={getStatusColor(selectedPayment.status)}>
                        {selectedPayment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {selectedPayment.payment_id}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Amount */}
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border-2 border-green-200 dark:border-green-900">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Amount</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                    </p>
                  </div>

                  {/* User Info */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer Information
                    </h4>
                    <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedPayment.user_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a
                          href={`mailto:${selectedPayment.user_email}`}
                          className="font-medium hover:text-primary"
                        >
                          {selectedPayment.user_email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Tool Info */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Tool Information
                    </h4>
                    <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
                      <div>
                        <p className="text-xs text-muted-foreground">Tool Name</p>
                        <p className="font-medium">{selectedPayment.tool_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Listing Type</p>
                        <Badge variant="outline" className="mt-1">
                          {selectedPayment.listing_type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Details
                    </h4>
                    <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Payment Method</p>
                          <p className="font-medium capitalize">{selectedPayment.payment_method}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Currency</p>
                          <p className="font-medium">{selectedPayment.currency}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created At</p>
                        <p className="font-medium">
                          {new Date(selectedPayment.created_at).toLocaleString()}
                        </p>
                      </div>
                      {selectedPayment.completed_at && (
                        <div>
                          <p className="text-xs text-muted-foreground">Completed At</p>
                          <p className="font-medium">
                            {new Date(selectedPayment.completed_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {selectedPayment.status === "completed" && (
                      <Button
                        onClick={() => handleRefund(selectedPayment)}
                        variant="outline"
                        className="gap-2"
                        disabled={updating === selectedPayment.id}
                      >
                        <RefreshCw className={`h-4 w-4 ${updating === selectedPayment.id ? 'animate-spin' : ''}`} />
                        Process Refund
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(selectedPayment.id)}
                      className="gap-2"
                      disabled={updating === selectedPayment.id}
                    >
                      <XCircle className="h-4 w-4" />
                      {updating === selectedPayment.id ? "Deleting..." : "Delete Record"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a payment to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full mx-4 shadow-2xl border-2">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Process Refund
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundData({
                      refundType: "full",
                      refundAmount: "",
                      reason: "",
                    });
                  }}
                  className="h-8 w-8 p-0"
                  disabled={refundLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Refund payment for {selectedPayment.tool_name}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Info */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Original Amount</span>
                  <span className="font-bold text-lg">
                    {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Customer</span>
                  <span className="font-medium">{selectedPayment.user_name}</span>
                </div>
              </div>

              {/* Refund Type */}
              <div className="space-y-2">
                <Label>Refund Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={refundData.refundType === "full" ? "default" : "outline"}
                    onClick={() => {
                      setRefundData({
                        ...refundData,
                        refundType: "full",
                        refundAmount: formatAmount(selectedPayment.amount, selectedPayment.currency).replace(/[^0-9.]/g, ""),
                      });
                    }}
                    className="flex-1"
                    disabled={refundLoading}
                  >
                    Full Refund
                  </Button>
                  <Button
                    type="button"
                    variant={refundData.refundType === "partial" ? "default" : "outline"}
                    onClick={() => {
                      setRefundData({
                        ...refundData,
                        refundType: "partial",
                        refundAmount: "",
                      });
                    }}
                    className="flex-1"
                    disabled={refundLoading}
                  >
                    Partial Refund
                  </Button>
                </div>
              </div>

              {/* Refund Amount */}
              {refundData.refundType === "partial" && (
                <div className="space-y-2">
                  <Label htmlFor="refundAmount">
                    Refund Amount <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="refundAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={selectedPayment.amount / 100}
                      value={refundData.refundAmount}
                      onChange={(e) =>
                        setRefundData({ ...refundData, refundAmount: e.target.value })
                      }
                      placeholder="0.00"
                      className="pl-8"
                      disabled={refundLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum: {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                  </p>
                </div>
              )}

              {/* Refund Reason */}
              <div className="space-y-2">
                <Label htmlFor="refundReason">
                  Reason for Refund <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="refundReason"
                  value={refundData.reason}
                  onChange={(e) =>
                    setRefundData({ ...refundData, reason: e.target.value })
                  }
                  placeholder="Enter the reason for this refund..."
                  rows={4}
                  disabled={refundLoading}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This reason will be sent to the customer via email
                </p>
              </div>

              {/* Warning */}
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-semibold mb-1">Important</p>
                  <p>
                    This action cannot be undone. The refund will be processed immediately and the
                    customer will be notified via email.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundData({
                      refundType: "full",
                      refundAmount: "",
                      reason: "",
                    });
                  }}
                  disabled={refundLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={processRefund}
                  disabled={refundLoading}
                  className="flex-1 gap-2"
                >
                  {refundLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Process Refund
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

