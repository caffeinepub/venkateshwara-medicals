import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Package,
  ShieldCheck,
  Star,
  Stethoscope,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Category, type Product } from "../backend";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";
import { useGetFeaturedProducts, useInitialize } from "../hooks/useQueries";
import { getCategoryIcon, getCategoryLabel } from "../lib/productUtils";

const CATEGORIES = [
  { value: Category.medicines, label: "Medicines" },
  { value: Category.firstAid, label: "First Aid" },
  { value: Category.personalCare, label: "Personal Care" },
  { value: Category.medicalEquipment, label: "Medical Equipment" },
  { value: Category.vitaminsSupplements, label: "Vitamins & Supplements" },
];

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    label: "Licensed Pharmacy",
    desc: "Govt. approved & certified",
  },
  { icon: Package, label: "Genuine Products", desc: "100% authentic brands" },
  { icon: Truck, label: "Fast Delivery", desc: "Same-day delivery available" },
  { icon: Stethoscope, label: "Expert Advice", desc: "Qualified pharmacists" },
];

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: initialized } = useInitialize();
  const isInitialized = initialized === true;
  const { data: featuredProducts, isLoading } =
    useGetFeaturedProducts(isInitialized);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[420px] md:min-h-[500px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-banner.dim_1400x500.png')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(15,69,38,0.92) 0%, rgba(26,107,60,0.75) 50%, rgba(26,107,60,0.3) 100%)",
          }}
        />
        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4" style={{ color: "#c8a84b" }} />
              <span
                className="font-body text-sm font-medium"
                style={{ color: "#c8a84b" }}
              >
                Trusted Since 2005
              </span>
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight mb-4">
              Your Health,
              <br />
              <span style={{ color: "#c8a84b" }}>Our Priority</span>
            </h1>
            <p className="font-body text-base text-green-100 mb-8 leading-relaxed">
              Venkateshwara Medicals — your trusted neighborhood pharmacy with
              500+ genuine products, expert pharmacists, and same-day delivery.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button
                  size="lg"
                  className="font-body font-semibold gap-2 shadow-lg"
                  style={{ backgroundColor: "#c8a84b", color: "#0f4526" }}
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  size="lg"
                  variant="outline"
                  data-ocid="hero.learn_more_button"
                  className="font-body font-semibold border-white/50 text-white bg-transparent hover:bg-white/10 hover:text-white"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section
        className="py-8 border-b border-border"
        style={{ backgroundColor: "#f0f9f4" }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 p-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#1a6b3c" }}
                >
                  <badge.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-foreground">
                    {badge.label}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {badge.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-3xl text-foreground mb-2">
              Shop by Category
            </h2>
            <p className="font-body text-muted-foreground">
              Find exactly what you need
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                to="/products"
                search={{ category: cat.value }}
                className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-border bg-card hover:border-primary hover:shadow-card-hover transition-all duration-200"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <img
                    src={getCategoryIcon(cat.value)}
                    alt={cat.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.src = `https://placehold.co/64x64/e8f5ee/1a6b3c?text=${cat.label.slice(0, 2)}`;
                    }}
                  />
                </div>
                <span className="font-body text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-14" style={{ backgroundColor: "#f0f9f4" }}>
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-heading font-bold text-3xl text-foreground mb-2">
                Featured Products
              </h2>
              <p className="font-body text-muted-foreground">
                Our most popular healthcare essentials
              </p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1 font-body text-sm font-medium hover:underline"
              style={{ color: "#1a6b3c" }}
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {["s1", "s2", "s3", "s4", "s5", "s6"].map((sk) => (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(featuredProducts || []).slice(0, 6).map((product) => (
                <ProductCard
                  key={Number(product.id)}
                  product={product}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/products">
              <Button
                variant="outline"
                className="font-body gap-2"
                style={{ borderColor: "#1a6b3c", color: "#1a6b3c" }}
              >
                View All Products <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-14" style={{ backgroundColor: "#1a6b3c" }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-3">
            Need a Prescription Filled?
          </h2>
          <p className="font-body text-green-100 mb-6 max-w-xl mx-auto">
            Upload your prescription and our licensed pharmacists will prepare
            your order. Fast, safe, and reliable.
          </p>
          <Link to="/products">
            <Button
              size="lg"
              className="font-body font-semibold gap-2"
              style={{ backgroundColor: "#c8a84b", color: "#0f4526" }}
            >
              Order Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <ProductDetailModal
        product={selectedProduct}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
