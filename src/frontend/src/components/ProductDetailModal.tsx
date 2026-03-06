import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Minus, Plus, ShoppingCart, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import {
  getCategoryColor,
  getCategoryLabel,
  getProductImageUrl,
} from "../lib/productUtils";
import { useCartStore } from "../store/cartStore";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  open,
  onClose,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((s) => s.addToCart);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(
      {
        productId: Number(product.id),
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      quantity,
    );
    toast.success(`${quantity}x ${product.name} added to cart`);
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setQuantity(1);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-2/5 bg-secondary flex items-center justify-center min-h-48 md:min-h-full">
            <img
              src={getProductImageUrl(product)}
              alt={product.name}
              className="w-full h-56 md:h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://placehold.co/400x400/e8f5ee/1a6b3c?text=${encodeURIComponent(product.name.slice(0, 15))}`;
              }}
            />
          </div>

          {/* Details */}
          <div className="md:w-3/5 p-6 flex flex-col">
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  className="text-xs font-body"
                  style={{
                    backgroundColor: getCategoryColor(product.category),
                    color: "#fff",
                  }}
                >
                  {getCategoryLabel(product.category)}
                </Badge>
                {product.featured && (
                  <Badge
                    className="text-xs font-body"
                    style={{ backgroundColor: "#c8a84b", color: "#0f4526" }}
                  >
                    Featured
                  </Badge>
                )}
              </div>
              <DialogTitle className="font-heading text-xl text-foreground leading-snug">
                {product.name}
              </DialogTitle>
              <DialogDescription className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">
                {product.description}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-auto space-y-4">
              {/* Price */}
              <div className="flex items-center justify-between">
                <span
                  className="font-heading font-bold text-2xl"
                  style={{ color: "#1a6b3c" }}
                >
                  ₹{product.price.toFixed(0)}
                </span>
                <div className="flex items-center gap-1.5">
                  {product.stockAvailable ? (
                    <>
                      <CheckCircle
                        className="w-4 h-4"
                        style={{ color: "#1a6b3c" }}
                      />
                      <span
                        className="font-body text-sm font-medium"
                        style={{ color: "#1a6b3c" }}
                      >
                        In Stock
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="font-body text-sm font-medium text-destructive">
                        Out of Stock
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Quantity selector */}
              {product.stockAvailable && (
                <div className="flex items-center gap-3">
                  <span className="font-body text-sm font-medium text-foreground">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-body font-semibold text-sm border-x border-border min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-body text-sm text-muted-foreground">
                    Total:{" "}
                    <strong style={{ color: "#1a6b3c" }}>
                      ₹{(product.price * quantity).toFixed(0)}
                    </strong>
                  </span>
                </div>
              )}

              <Button
                className="w-full font-body font-medium gap-2"
                style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
                disabled={!product.stockAvailable}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
