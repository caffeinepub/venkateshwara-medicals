import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { getProductImageUrl } from "../lib/productUtils";
import { useCartStore } from "../store/cartStore";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getCartTotal } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#f0f9f4" }}
        >
          <ShoppingBag className="w-10 h-10" style={{ color: "#1a6b3c" }} />
        </div>
        <div className="text-center">
          <h2 className="font-heading text-2xl text-foreground mb-2">
            Your cart is empty
          </h2>
          <p className="font-body text-muted-foreground">
            Add some products to get started
          </p>
        </div>
        <Link to="/products">
          <Button
            style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
            className="font-body gap-2"
          >
            Browse Products <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-heading font-bold text-3xl text-foreground mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 p-4 bg-card rounded-xl border border-border shadow-xs"
              >
                <img
                  src={getProductImageUrl({
                    imageUrl: item.imageUrl,
                    name: item.name,
                  } as any)}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg bg-secondary shrink-0"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.src = "https://placehold.co/80x80/e8f5ee/1a6b3c?text=Rx";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-body font-semibold text-base text-foreground line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground mt-0.5">
                    ₹{item.price.toFixed(0)} per unit
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="px-3 py-1.5 hover:bg-secondary transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1.5 font-body font-semibold text-sm border-x border-border min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="px-3 py-1.5 hover:bg-secondary transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="font-heading font-bold text-base"
                        style={{ color: "#1a6b3c" }}
                      >
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={clearCart}
              className="font-body text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all items
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h2 className="font-heading font-semibold text-lg text-foreground mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between font-body text-sm"
                  >
                    <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                      {item.name} ×{item.quantity}
                    </span>
                    <span className="text-foreground shrink-0">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center mb-6">
                <span className="font-body font-semibold text-foreground">
                  Total
                </span>
                <span
                  className="font-heading font-bold text-2xl"
                  style={{ color: "#1a6b3c" }}
                >
                  ₹{getCartTotal().toFixed(0)}
                </span>
              </div>
              <Link to="/checkout">
                <Button
                  className="w-full font-body font-semibold gap-2"
                  style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link
                to="/products"
                className="block text-center mt-3 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
