import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import type { Category, Product } from "../backend";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";
import {
  useGetAllProducts,
  useGetProductsByCategory,
  useInitialize,
} from "../hooks/useQueries";
import { ALL_CATEGORIES } from "../lib/productUtils";

export default function ProductsPage() {
  const search = useSearch({ strict: false }) as { category?: Category };
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    search?.category ?? null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: initialized } = useInitialize();
  const isInitialized = initialized === true;

  const { data: allProducts, isLoading: allLoading } =
    useGetAllProducts(isInitialized);
  const { data: categoryProducts, isLoading: catLoading } =
    useGetProductsByCategory(selectedCategory, isInitialized);

  const isLoading = selectedCategory ? catLoading : allLoading;
  const rawProducts = selectedCategory
    ? (categoryProducts ?? [])
    : (allProducts ?? []);

  const filteredProducts = searchTerm.trim()
    ? rawProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : rawProducts;

  useEffect(() => {
    if (search?.category) {
      setSelectedCategory(search.category);
    }
  }, [search?.category]);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div
        className="py-10 border-b border-border"
        style={{ backgroundColor: "#f0f9f4" }}
      >
        <div className="container mx-auto px-4">
          <h1 className="font-heading font-bold text-3xl text-foreground mb-1">
            Our Products
          </h1>
          <p className="font-body text-muted-foreground">
            Browse our complete range of medicines and healthcare products
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 font-body"
            />
          </div>
          <div className="flex items-center gap-1.5 text-sm font-body text-muted-foreground">
            <SlidersHorizontal className="w-4 h-4" />
            <span>
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {ALL_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.label}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full font-body text-sm font-medium transition-all duration-200 border ${
                selectedCategory === cat.value
                  ? "text-white border-transparent shadow-sm"
                  : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
              }`}
              style={
                selectedCategory === cat.value
                  ? { backgroundColor: "#1a6b3c", borderColor: "#1a6b3c" }
                  : {}
              }
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((sk) => (
              <div
                key={sk}
                className="rounded-xl overflow-hidden border border-border"
              >
                <Skeleton className="h-44 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "#f0f9f4" }}
            >
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-xl text-foreground mb-2">
              No products found
            </h3>
            <p className="font-body text-muted-foreground">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : "No products in this category yet."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setSearchTerm("");
              }}
              className="mt-4 font-body text-sm font-medium underline"
              style={{ color: "#1a6b3c" }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={Number(product.id)}
                product={product}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
