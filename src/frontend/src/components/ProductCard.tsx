import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingCart, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../backend";
import {
  getCategoryColor,
  getCategoryLabel,
  getProductImageUrl,
} from "../lib/productUtils";
import { useCartStore } from "../store/cartStore";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
}: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.stockAvailable) return;
    addToCart({
      productId: Number(product.id),
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <button
      type="button"
      className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer group border border-border flex flex-col text-left w-full"
      onClick={() => onViewDetails(product)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-secondary h-44">
        <img
          src={getProductImageUrl(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://placehold.co/300x200/e8f5ee/1a6b3c?text=${encodeURIComponent(product.name.slice(0, 15))}`;
          }}
        />
        {product.featured && (
          <span
            className="absolute top-2 left-2 text-xs font-body font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#c8a84b", color: "#0f4526" }}
          >
            Featured
          </span>
        )}
        {!product.stockAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-body font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Badge
          variant="secondary"
          className="self-start mb-2 text-xs font-body"
          style={{
            backgroundColor: getCategoryColor(product.category),
            color: "#fff",
          }}
        >
          {getCategoryLabel(product.category)}
        </Badge>

        <h3 className="font-heading font-semibold text-base text-foreground mb-1 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        <p className="font-body text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span
              className="font-heading font-bold text-lg"
              style={{ color: "#1a6b3c" }}
            >
              ₹{product.price.toFixed(0)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {product.stockAvailable ? (
              <CheckCircle
                className="w-3.5 h-3.5"
                style={{ color: "#1a6b3c" }}
              />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-destructive" />
            )}
            <span className="font-body text-xs text-muted-foreground">
              {product.stockAvailable ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>

        <Button
          className="mt-3 w-full font-body text-sm font-medium gap-2"
          style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
          disabled={!product.stockAvailable}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </div>
    </button>
  );
}
