import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  QrCode,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetOrder, useSubmitPaymentProof } from "../hooks/useQueries";

export default function PaymentPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState("");
  const [txError, setTxError] = useState("");

  const { data: order, isLoading: isLoadingOrder } = useGetOrder(
    orderId ? BigInt(orderId) : null,
  );
  const { mutateAsync: submitProof, isPending } = useSubmitPaymentProof();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setTxError("Please enter your UPI transaction ID");
      return;
    }
    setTxError("");
    try {
      await submitProof({
        orderId: BigInt(orderId),
        transactionId: transactionId.trim(),
      });
      toast.success("Payment proof submitted! Awaiting verification.");
      navigate({
        to: "/order-confirmation/$orderId",
        params: { orderId },
      });
    } catch (_err) {
      toast.error("Failed to submit payment proof. Please try again.");
    }
  };

  if (isLoadingOrder) {
    return (
      <div
        data-ocid="payment.loading_state"
        className="min-h-[60vh] flex items-center justify-center gap-3"
      >
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "#1a6b3c" }}
        />
        <span className="font-body text-muted-foreground">
          Loading order details…
        </span>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        data-ocid="payment.error_state"
        className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="font-heading font-bold text-2xl text-foreground">
          Order Not Found
        </h2>
        <p className="font-body text-muted-foreground max-w-sm">
          We couldn't find order #{orderId}. Please check your order details.
        </p>
        <Button
          onClick={() => navigate({ to: "/" })}
          style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
          className="font-body"
        >
          Go to Home
        </Button>
      </div>
    );
  }

  // Already confirmed — redirect message
  if (order.paymentStatus === "paymentConfirmed") {
    return (
      <div
        data-ocid="payment.success_state"
        className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <CheckCircle2 className="w-12 h-12" style={{ color: "#1a6b3c" }} />
        <h2 className="font-heading font-bold text-2xl text-foreground">
          Payment Already Confirmed
        </h2>
        <p className="font-body text-muted-foreground">
          This order has already been paid and confirmed.
        </p>
        <Button
          onClick={() =>
            navigate({
              to: "/order-confirmation/$orderId",
              params: { orderId },
            })
          }
          style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
          className="font-body"
        >
          View Order
        </Button>
      </div>
    );
  }

  const amount = order.totalPrice.toFixed(0);

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#f0f9f4" }}
          >
            <QrCode className="w-8 h-8" style={{ color: "#1a6b3c" }} />
          </div>
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
            Complete Your Payment
          </h1>
          <p className="font-body text-muted-foreground text-sm">
            Order #{orderId} · Scan the QR code below to pay
          </p>
        </div>

        {/* Amount Banner */}
        <div
          className="rounded-xl p-5 mb-6 text-center"
          style={{ backgroundColor: "#f0f9f4", border: "2px solid #1a6b3c" }}
        >
          <p className="font-body text-sm text-muted-foreground mb-1">
            Amount to Pay
          </p>
          <p
            className="font-heading font-bold text-5xl"
            style={{ color: "#1a6b3c" }}
          >
            ₹{amount}
          </p>
        </div>

        {/* QR Code Card */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          {/* QR Code Image */}
          <div className="flex justify-center mb-6">
            <div
              className="rounded-xl p-3 border border-border shadow-sm"
              style={{ backgroundColor: "#fff" }}
            >
              <img
                src="/assets/generated/upi-qr-code.dim_400x500.png"
                alt="UPI QR Code for Venkateshwara Medicals"
                className="w-56 h-auto object-contain"
              />
            </div>
          </div>

          {/* Instructions */}
          <div
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: "#fdf8ed", border: "1px solid #e8d5a0" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" style={{ color: "#c8a84b" }} />
              <p className="font-body text-sm font-semibold text-foreground">
                How to Pay
              </p>
            </div>
            <ol className="font-body text-sm text-muted-foreground space-y-1.5 list-none">
              <li className="flex items-start gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: "#1a6b3c" }}
                >
                  1
                </span>
                Open any UPI app (Google Pay, PhonePe, Paytm)
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: "#1a6b3c" }}
                >
                  2
                </span>
                Scan the QR code above
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: "#1a6b3c" }}
                >
                  3
                </span>
                Pay exactly{" "}
                <strong style={{ color: "#1a6b3c" }}>₹{amount}</strong>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: "#1a6b3c" }}
                >
                  4
                </span>
                Note down the UPI transaction ID shown in your app
              </li>
            </ol>
          </div>

          {/* Transaction ID Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="transaction-id"
                className="font-body text-sm font-medium mb-1.5 block"
              >
                UPI Transaction ID *
              </Label>
              <Input
                id="transaction-id"
                data-ocid="payment.transaction_id_input"
                value={transactionId}
                onChange={(e) => {
                  setTransactionId(e.target.value);
                  if (txError) setTxError("");
                }}
                placeholder="e.g. 123456789012"
                className={`font-body ${txError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {txError && (
                <p
                  data-ocid="payment.transaction_id_error"
                  className="font-body text-xs text-destructive mt-1 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {txError}
                </p>
              )}
              <p className="font-body text-xs text-muted-foreground mt-1.5">
                You can find this ID in your UPI app's transaction history.
              </p>
            </div>

            <Button
              type="submit"
              data-ocid="payment.submit_button"
              disabled={isPending}
              className="w-full font-body font-semibold gap-2 h-12 text-base"
              style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />I Have Paid
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Trust note */}
        <p className="font-body text-xs text-muted-foreground text-center">
          🔒 Your payment will be verified by our pharmacist before your order
          is confirmed.
        </p>
      </div>
    </div>
  );
}
