import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePlaceOrder } from "../hooks/useQueries";
import { getProductImageUrl } from "../lib/productUtils";
import { useCartStore } from "../store/cartStore";

interface FormData {
  customerName: string;
  phoneNumber: string;
  addressLine1: string;
  city: string;
  pincode: string;
  prescriptionNote: string;
}

const initialForm: FormData = {
  customerName: "",
  phoneNumber: "",
  addressLine1: "",
  city: "",
  pincode: "",
  prescriptionNote: "",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground opacity-30" />
        <div className="text-center">
          <h2 className="font-heading text-2xl text-foreground mb-2">
            Your cart is empty
          </h2>
          <p className="font-body text-muted-foreground">
            Add products before checking out
          </p>
        </div>
        <Link to="/products">
          <Button
            style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
            className="font-body"
          >
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.customerName.trim()) newErrors.customerName = "Name is required";
    if (!form.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber.trim()))
      newErrors.phoneNumber = "Enter a valid 10-digit mobile number";
    if (!form.addressLine1.trim())
      newErrors.addressLine1 = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode.trim()))
      newErrors.pincode = "Enter a valid 6-digit pincode";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await placeOrder({
        customerName: form.customerName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        address: {
          line1: form.addressLine1.trim(),
          city: form.city.trim(),
          pincode: form.pincode.trim(),
        },
        prescriptionNote: form.prescriptionNote.trim() || undefined,
        items: items.map((item) => ({
          productId: BigInt(item.productId),
          quantity: BigInt(item.quantity),
        })),
      });

      clearCart();
      navigate({
        to: "/payment/$orderId",
        params: { orderId: response.orderId.toString() },
      });
    } catch (_err) {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="font-heading font-bold text-3xl text-foreground mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Customer Details */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-heading font-semibold text-lg text-foreground mb-5">
                  Customer Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="customerName"
                      className="font-body text-sm font-medium"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="customerName"
                      value={form.customerName}
                      onChange={(e) =>
                        handleChange("customerName", e.target.value)
                      }
                      placeholder="Enter your full name"
                      className={`mt-1 font-body ${errors.customerName ? "border-destructive" : ""}`}
                    />
                    {errors.customerName && (
                      <p className="font-body text-xs text-destructive mt-1">
                        {errors.customerName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="phoneNumber"
                      className="font-body text-sm font-medium"
                    >
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={form.phoneNumber}
                      onChange={(e) =>
                        handleChange("phoneNumber", e.target.value)
                      }
                      placeholder="10-digit mobile number"
                      className={`mt-1 font-body ${errors.phoneNumber ? "border-destructive" : ""}`}
                    />
                    {errors.phoneNumber && (
                      <p className="font-body text-xs text-destructive mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-heading font-semibold text-lg text-foreground mb-5">
                  Delivery Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="addressLine1"
                      className="font-body text-sm font-medium"
                    >
                      Address Line 1 *
                    </Label>
                    <Input
                      id="addressLine1"
                      value={form.addressLine1}
                      onChange={(e) =>
                        handleChange("addressLine1", e.target.value)
                      }
                      placeholder="House/Flat no., Street, Area"
                      className={`mt-1 font-body ${errors.addressLine1 ? "border-destructive" : ""}`}
                    />
                    {errors.addressLine1 && (
                      <p className="font-body text-xs text-destructive mt-1">
                        {errors.addressLine1}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="city"
                        className="font-body text-sm font-medium"
                      >
                        City *
                      </Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="City"
                        className={`mt-1 font-body ${errors.city ? "border-destructive" : ""}`}
                      />
                      {errors.city && (
                        <p className="font-body text-xs text-destructive mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="pincode"
                        className="font-body text-sm font-medium"
                      >
                        Pincode *
                      </Label>
                      <Input
                        id="pincode"
                        value={form.pincode}
                        onChange={(e) =>
                          handleChange("pincode", e.target.value)
                        }
                        placeholder="6-digit pincode"
                        className={`mt-1 font-body ${errors.pincode ? "border-destructive" : ""}`}
                      />
                      {errors.pincode && (
                        <p className="font-body text-xs text-destructive mt-1">
                          {errors.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prescription Note */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-heading font-semibold text-lg text-foreground mb-2">
                  Prescription Note
                </h2>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Optional: Add any prescription details or special instructions
                </p>
                <Textarea
                  value={form.prescriptionNote}
                  onChange={(e) =>
                    handleChange("prescriptionNote", e.target.value)
                  }
                  placeholder="E.g., Prescription for Dr. Sharma dated 01/03/2026..."
                  className="font-body resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-3 items-center"
                    >
                      <img
                        src={getProductImageUrl({
                          imageUrl: item.imageUrl,
                          name: item.name,
                        } as any)}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg bg-secondary shrink-0"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          t.src =
                            "https://placehold.co/48x48/e8f5ee/1a6b3c?text=Rx";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium text-foreground line-clamp-1">
                          {item.name}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          ×{item.quantity}
                        </p>
                      </div>
                      <span
                        className="font-body text-sm font-semibold shrink-0"
                        style={{ color: "#1a6b3c" }}
                      >
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center mb-6">
                  <span className="font-body font-semibold text-foreground">
                    Total Amount
                  </span>
                  <span
                    className="font-heading font-bold text-2xl"
                    style={{ color: "#1a6b3c" }}
                  >
                    ₹{getCartTotal().toFixed(0)}
                  </span>
                </div>
                <Button
                  type="submit"
                  className="w-full font-body font-semibold gap-2"
                  style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
                <p className="font-body text-xs text-muted-foreground text-center mt-3">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
