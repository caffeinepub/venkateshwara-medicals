import { Button } from "@/components/ui/button";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowRight, CheckCircle, MapPin, Package, Phone } from "lucide-react";
import { useGetOrder } from "../hooks/useQueries";
import { useCartStore } from "../store/cartStore";

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const clearCart = useCartStore((s) => s.clearCart);

  const { data: order, isLoading } = useGetOrder(
    orderId ? BigInt(orderId) : null,
  );

  const formatDate = (timestamp: bigint) => {
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success header */}
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "#f0f9f4" }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: "#1a6b3c" }} />
          </div>
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
            Order Placed!
          </h1>
          <p className="font-body text-muted-foreground">
            Thank you for shopping with Venkateshwara Medicals. Your order has
            been received.
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
            <Package className="w-5 h-5" style={{ color: "#1a6b3c" }} />
            <div>
              <p className="font-body text-sm text-muted-foreground">
                Order ID
              </p>
              <p
                className="font-heading font-bold text-xl"
                style={{ color: "#1a6b3c" }}
              >
                #{orderId}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-4 bg-secondary rounded animate-pulse"
                />
              ))}
            </div>
          ) : order ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 font-body text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">
                    {order.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium text-foreground">
                    {formatDate(order.timestamp)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 font-body text-sm">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">
                    {order.phoneNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 font-body text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Delivery Address</p>
                  <p className="font-medium text-foreground">
                    {order.address.line1}, {order.address.city} –{" "}
                    {order.address.pincode}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="font-body font-semibold text-foreground">
                  Total Paid
                </span>
                <span
                  className="font-heading font-bold text-2xl"
                  style={{ color: "#1a6b3c" }}
                >
                  ₹{order.totalPrice.toFixed(0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 font-body text-sm text-muted-foreground">
              <p>Order #{orderId} has been successfully placed.</p>
              <p>
                Our team will contact you shortly to confirm delivery details.
              </p>
            </div>
          )}
        </div>

        {/* Info box */}
        <div
          className="rounded-xl p-4 mb-8 font-body text-sm"
          style={{
            backgroundColor: "#f0f9f4",
            borderLeft: "4px solid #1a6b3c",
          }}
        >
          <p className="font-medium text-foreground mb-1">What happens next?</p>
          <ul className="text-muted-foreground space-y-1 list-disc list-inside">
            <li>Our pharmacist will review your order</li>
            <li>You'll receive a call to confirm delivery time</li>
            <li>Delivery within 2–4 hours (same-day orders)</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" onClick={clearCart} className="flex-1">
            <Button
              className="w-full font-body font-semibold gap-2"
              style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button
              variant="outline"
              className="w-full font-body"
              style={{ borderColor: "#1a6b3c", color: "#1a6b3c" }}
            >
              Browse More Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
