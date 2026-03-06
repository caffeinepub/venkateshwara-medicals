import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { getProductImageUrl } from "../lib/productUtils";
import { useCartStore } from "../store/cartStore";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
  } = useCartStore();

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        <SheetHeader
          className="px-6 py-4 border-b border-border"
          style={{ backgroundColor: "#1a6b3c" }}
        >
          <div className="flex items-center justify-between">
            <SheetTitle className="font-heading text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Your Cart
              {items.length > 0 && (
                <span
                  className="text-xs font-body font-normal px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#c8a84b", color: "#0f4526" }}
                >
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              )}
            </SheetTitle>
            <SheetClose asChild>
              <button
                type="button"
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <ShoppingBag className="w-16 h-16 text-muted-foreground opacity-30" />
              <div>
                <p className="font-heading text-lg text-foreground">
                  Your cart is empty
                </p>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Add products to get started
                </p>
              </div>
              <SheetClose asChild>
                <Link to="/products">
                  <Button
                    style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
                    className="font-body"
                  >
                    Browse Products
                  </Button>
                </Link>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 p-3 bg-secondary rounded-lg border border-border"
                >
                  <img
                    src={getProductImageUrl({
                      imageUrl: item.imageUrl,
                      name: item.name,
                    } as any)}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md bg-background shrink-0"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.src =
                        "https://placehold.co/64x64/e8f5ee/1a6b3c?text=Rx";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-sm text-foreground line-clamp-2 leading-snug">
                      {item.name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      ₹{item.price.toFixed(0)} each
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="px-2 py-1 hover:bg-secondary transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 py-1 font-body text-sm font-semibold border-x border-border min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="px-2 py-1 hover:bg-secondary transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-heading font-bold text-sm"
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
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="px-4 py-4 border-t border-border bg-background flex-col gap-3">
            <div className="flex items-center justify-between w-full">
              <span className="font-body text-sm text-muted-foreground">
                Subtotal
              </span>
              <span
                className="font-heading font-bold text-xl"
                style={{ color: "#1a6b3c" }}
              >
                ₹{getCartTotal().toFixed(0)}
              </span>
            </div>
            <SheetClose asChild>
              <Link to="/checkout" className="w-full">
                <Button
                  className="w-full font-body font-semibold"
                  style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
                >
                  Proceed to Checkout
                </Button>
              </Link>
            </SheetClose>
            <button
              type="button"
              onClick={clearCart}
              className="font-body text-xs text-muted-foreground hover:text-destructive transition-colors text-center w-full"
            >
              Clear Cart
            </button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
