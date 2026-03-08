import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useLocation,
} from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  ExternalLink,
  IndianRupee,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Package,
  PackageX,
  Plus,
  ShieldAlert,
  ShoppingBag,
  Star,
  Store,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { ThemeProvider } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Order } from "../../backend";
import { Category, type Product } from "../../backend";
import {
  useConfirmPayment,
  useGetAllProducts,
  useGetConfirmedOrders,
  useGetPendingPaymentOrders,
  useInitialize,
  usePlaceOrder,
  useRejectPayment,
} from "../../hooks/useQueries";
import {
  addAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  getStockOverrides,
  setStockOverride,
} from "../../lib/adminOverrides";
import { getCategoryLabel, getProductImageUrl } from "../../lib/productUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SHOPKEEPER_PIN = "admin123";
const SESSION_KEY = "shopkeeper_unlocked";

const CATEGORY_OPTIONS = [
  { value: Category.medicines, label: "Medicines" },
  { value: Category.firstAid, label: "First Aid" },
  { value: Category.personalCare, label: "Personal Care" },
  { value: Category.medicalEquipment, label: "Medical Equipment" },
  { value: Category.vitaminsSupplements, label: "Vitamins & Supplements" },
];

interface ProductFormData {
  name: string;
  category: Category;
  description: string;
  price: string;
  imageUrl: string;
  featured: boolean;
  stockAvailable: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  category: Category.medicines,
  description: "",
  price: "",
  imageUrl: "",
  featured: false,
  stockAvailable: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Shopkeeper Landing Page (shown before authentication)
// ─────────────────────────────────────────────────────────────────────────────

function ShopkeeperLanding({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full bg-amber-600/4 blur-3xl" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.7 0.15 80) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.7 0.15 80) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-400/15 border border-amber-400/20">
            <Store className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div>
            <div className="font-heading font-bold text-white text-sm leading-none tracking-tight">
              Venkateshwara Medicals
            </div>
            <div className="font-body text-[10px] text-slate-500 leading-none mt-0.5 tracking-widest uppercase">
              Staff Portal
            </div>
          </div>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="shopkeeper.landing.customer_link"
          className="font-body text-xs text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Customer Store →
        </a>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Icon badge */}
        <div className="mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/25 shadow-lg shadow-amber-500/10">
            <ShieldAlert className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight tracking-tight mb-4 max-w-2xl">
          Shopkeeper <span className="text-amber-400">Management</span> Portal
        </h1>

        {/* Description */}
        <p className="font-body text-slate-400 text-lg max-w-md leading-relaxed mb-10">
          Staff-only management system. Manage products, verify payments, track
          orders and revenue — all in one place.
        </p>

        {/* Features row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {[
            { icon: Package, label: "Product Catalogue" },
            { icon: CreditCard, label: "Payment Verification" },
            { icon: ClipboardList, label: "Order Tracking" },
            { icon: TrendingUp, label: "Revenue Analytics" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/60 bg-slate-800/50 text-slate-400 text-sm font-body"
            >
              <Icon className="w-3.5 h-3.5 text-amber-400" />
              {label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          data-ocid="shopkeeper.landing.enter_button"
          onClick={onEnter}
          size="lg"
          className="font-body font-semibold text-base gap-2 px-8 py-6 bg-amber-500 hover:bg-amber-400 text-slate-900 border-0 shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:-translate-y-0.5"
        >
          <Lock className="w-5 h-5" />
          Enter Portal →
        </Button>
      </main>

      {/* Footer disclaimer */}
      <footer className="relative z-10 flex items-center justify-center px-6 py-5 border-t border-slate-800/60">
        <p className="font-body text-xs text-slate-600 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          This portal is for authorised staff only.
        </p>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIN Gate
// ─────────────────────────────────────────────────────────────────────────────

function PinGate({
  onUnlock,
  onBack,
}: {
  onUnlock: () => void;
  onBack?: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === SHOPKEEPER_PIN) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onUnlock();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      {/* Top branding */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-400/20 border border-amber-400/30">
            <Store className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-left">
            <div className="font-heading font-bold text-white text-lg leading-tight">
              Venkateshwara Medicals
            </div>
            <div className="text-slate-400 text-xs tracking-wider uppercase">
              Shopkeeper Portal
            </div>
          </div>
        </div>
      </div>

      <Card
        className={`w-full max-w-sm shadow-2xl border border-slate-700 bg-slate-800/90 backdrop-blur-sm transition-transform ${
          shaking ? "animate-[shake_0.4s_ease-in-out]" : ""
        }`}
      >
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 bg-amber-400/10 border border-amber-400/20">
            <ShieldAlert className="w-7 h-7 text-amber-400" />
          </div>
          <CardTitle className="font-heading text-xl text-white">
            Shopkeeper Access
          </CardTitle>
          <p className="font-body text-sm text-slate-400 mt-1">
            Enter your PIN to access the management portal
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="shopkeeper-pin"
                className="font-body text-sm text-slate-300"
              >
                PIN
              </Label>
              <Input
                id="shopkeeper-pin"
                data-ocid="shopkeeper.pin_input"
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Enter your PIN"
                autoFocus
                className={`font-body text-center tracking-widest text-lg bg-slate-700/80 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-amber-400/50 ${
                  error ? "border-red-500 focus-visible:ring-red-500/50" : ""
                }`}
              />
              {error && (
                <p
                  data-ocid="shopkeeper.pin.error_state"
                  className="font-body text-xs text-red-400 flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Incorrect PIN. Please try again.
                </p>
              )}
            </div>
            <Button
              type="submit"
              data-ocid="shopkeeper.pin.submit_button"
              className="w-full font-body font-semibold gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 border-0"
            >
              <Lock className="w-4 h-4" />
              Unlock Portal
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 font-body text-xs text-slate-600">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-slate-500 hover:text-slate-400 transition-colors"
          >
            ← Back
          </button>
        ) : (
          <a
            href="/"
            className="text-slate-500 hover:text-slate-400 transition-colors"
          >
            ← Back to Customer Site
          </a>
        )}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shopkeeper Navbar
// ─────────────────────────────────────────────────────────────────────────────

function ShopkeeperNavbar({ onLogout }: { onLogout: () => void }) {
  const { pathname } = useLocation();

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Products", icon: Package },
    { to: "/payments", label: "Payments", icon: CreditCard },
    { to: "/orders", label: "Orders", icon: ClipboardList },
    { to: "/sell", label: "Sell", icon: ShoppingBag },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-700/50 bg-slate-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top row: branding + logout */}
        <div className="flex items-center justify-between py-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-400/15 border border-amber-400/25">
              <Store className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="font-heading font-bold text-white text-sm leading-none">
                Shopkeeper Panel
              </span>
              <p className="font-body text-[10px] text-slate-400 leading-none mt-0.5">
                Venkateshwara Medicals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="shopkeeper.customer_site_link"
              className="font-body text-xs text-slate-400 hover:text-white transition-colors hidden sm:flex items-center gap-1.5 mr-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Customer Site
            </a>
            <Button
              size="sm"
              variant="ghost"
              data-ocid="shopkeeper.logout_button"
              onClick={onLogout}
              className="font-body text-xs gap-1.5 border border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1 py-1 overflow-x-auto">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/dashboard"
                ? pathname === "/" || pathname === "/dashboard"
                : pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                data-ocid={`shopkeeper.nav.${label.toLowerCase()}_link`}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-body text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout wrapper (wraps authenticated shopkeeper pages)
// ─────────────────────────────────────────────────────────────────────────────

function ShopkeeperLayout({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <ShopkeeperNavbar onLogout={onLogout} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared state hook for all admin data
// ─────────────────────────────────────────────────────────────────────────────

function useShopkeeperData() {
  const [stockOverrides, setStockOverridesState] = useState<
    Record<string, boolean>
  >(() => getStockOverrides());
  const [adminProducts, setAdminProductsState] = useState<Product[]>(() =>
    getAdminProducts(),
  );

  const { data: initData } = useInitialize();
  const isInitialized = !!initData;

  const { data: backendProducts, isLoading } = useGetAllProducts(isInitialized);
  const { data: pendingOrders = [] } =
    useGetPendingPaymentOrders(isInitialized);
  const { data: confirmedOrders = [], isLoading: isLoadingOrders } =
    useGetConfirmedOrders(isInitialized);

  const allProducts = useMemo(() => {
    const base: Product[] = backendProducts ?? [];
    return [...base, ...adminProducts];
  }, [backendProducts, adminProducts]);

  const adminProductIds = useMemo(
    () => new Set(adminProducts.map((p) => Number(p.id))),
    [adminProducts],
  );

  const refreshAdminData = () => {
    setStockOverridesState(getStockOverrides());
    setAdminProductsState(getAdminProducts());
  };

  useEffect(() => {
    const handleFocus = () => {
      setStockOverridesState(getStockOverrides());
      setAdminProductsState(getAdminProducts());
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleToggleStock = (productId: string, currentStock: boolean) => {
    const newStock = !currentStock;
    setStockOverride(productId, newStock);
    setStockOverridesState(getStockOverrides());
    toast.success(
      newStock
        ? "Product marked as In Stock"
        : "Product marked as Out of Stock",
    );
  };

  const handleDelete = (id: number) => {
    const product = adminProducts.find((p) => Number(p.id) === id);
    deleteAdminProduct(id);
    setAdminProductsState(getAdminProducts());
    toast.success(`"${product?.name ?? "Product"}" deleted`);
  };

  const totalProducts = allProducts.length;
  const outOfStockCount = allProducts.filter((p) => {
    const override = stockOverrides[String(p.id)];
    return override !== undefined ? !override : !p.stockAvailable;
  }).length;
  const totalRevenue = confirmedOrders.reduce(
    (sum, o) => sum + o.totalPrice,
    0,
  );

  return {
    allProducts,
    adminProductIds,
    stockOverrides,
    isInitialized,
    isLoading,
    isLoadingOrders,
    pendingOrders,
    confirmedOrders,
    totalProducts,
    outOfStockCount,
    totalRevenue,
    refreshAdminData,
    handleToggleStock,
    handleDelete,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview Tab content
// ─────────────────────────────────────────────────────────────────────────────

function OverviewContent({
  totalProducts,
  outOfStockCount,
  pendingPayments,
  confirmedOrders,
  totalRevenue,
  isLoading,
}: {
  totalProducts: number;
  outOfStockCount: number;
  pendingPayments: number;
  confirmedOrders: number;
  totalRevenue: number;
  isLoading: boolean;
}) {
  const stats = [
    {
      ocid: "shopkeeper.overview.total_products_card",
      label: "Total Products",
      value: isLoading ? "—" : String(totalProducts),
      icon: <Package className="w-5 h-5 text-emerald-400" />,
      bg: "bg-emerald-400/10",
      color: "text-emerald-400",
    },
    {
      ocid: "shopkeeper.overview.out_of_stock_card",
      label: "Out of Stock",
      value: isLoading ? "—" : String(outOfStockCount),
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      bg: "bg-red-400/10",
      color: "text-red-400",
    },
    {
      ocid: "shopkeeper.overview.pending_payments_card",
      label: "Pending Payments",
      value: isLoading ? "—" : String(pendingPayments),
      icon: <CreditCard className="w-5 h-5 text-amber-400" />,
      bg: "bg-amber-400/10",
      color: "text-amber-400",
    },
    {
      ocid: "shopkeeper.overview.confirmed_orders_card",
      label: "Confirmed Orders",
      value: isLoading ? "—" : String(confirmedOrders),
      icon: <ClipboardList className="w-5 h-5 text-blue-400" />,
      bg: "bg-blue-400/10",
      color: "text-blue-400",
    },
    {
      ocid: "shopkeeper.overview.revenue_card",
      label: "Total Revenue",
      value: isLoading ? "—" : `₹${totalRevenue.toFixed(0)}`,
      icon: <IndianRupee className="w-5 h-5 text-amber-300" />,
      bg: "bg-amber-300/10",
      color: "text-amber-300",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-white mb-1">
          Dashboard
        </h1>
        <p className="font-body text-sm text-slate-400">
          All store metrics in one place — products, payments, orders, and
          revenue.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <Card
            key={stat.ocid}
            data-ocid={stat.ocid}
            className="border border-slate-700/50 bg-slate-800/60 shadow-sm hover:bg-slate-800/90 transition-colors"
          >
            <CardContent className="p-4 flex flex-col gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="font-body text-xs text-slate-400 leading-tight">
                  {stat.label}
                </p>
                <p
                  className={`font-heading font-bold text-2xl leading-tight mt-0.5 ${stat.color}`}
                >
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-slate-700/50 bg-slate-800/60">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="font-heading text-sm flex items-center gap-2 text-amber-400">
              <TrendingUp className="w-4 h-4" />
              Revenue Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-slate-400">
                Confirmed Orders
              </span>
              <span className="font-body text-sm font-semibold text-emerald-400">
                {isLoading ? "—" : confirmedOrders}
              </span>
            </div>
            <Separator className="bg-slate-700/50" />
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-slate-400">
                Total Revenue
              </span>
              <span className="font-body text-sm font-semibold text-amber-400">
                {isLoading ? "—" : `₹${totalRevenue.toFixed(0)}`}
              </span>
            </div>
            <Separator className="bg-slate-700/50" />
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-slate-400">
                Avg Order Value
              </span>
              <span className="font-body text-sm font-semibold text-slate-300">
                {isLoading || confirmedOrders === 0
                  ? "—"
                  : `₹${(totalRevenue / confirmedOrders).toFixed(0)}`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-700/50 bg-slate-800/60">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="font-heading text-sm flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-slate-400">
                Payments to verify
              </span>
              <Badge
                variant="outline"
                className={`font-body text-xs ${
                  pendingPayments > 0
                    ? "border-amber-500/50 text-amber-400 bg-amber-400/10"
                    : "border-emerald-500/50 text-emerald-400 bg-emerald-400/10"
                }`}
              >
                {isLoading
                  ? "—"
                  : pendingPayments > 0
                    ? `${pendingPayments} pending`
                    : "All clear"}
              </Badge>
            </div>
            <Separator className="bg-slate-700/50" />
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-slate-400">
                Products out of stock
              </span>
              <Badge
                variant="outline"
                className={`font-body text-xs ${
                  outOfStockCount > 0
                    ? "border-red-500/50 text-red-400 bg-red-400/10"
                    : "border-emerald-500/50 text-emerald-400 bg-emerald-400/10"
                }`}
              >
                {isLoading
                  ? "—"
                  : outOfStockCount > 0
                    ? `${outOfStockCount} items`
                    : "All stocked"}
              </Badge>
            </div>
            <Separator className="bg-slate-700/50" />
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-slate-400">
                Total catalogue
              </span>
              <span className="font-body text-sm font-semibold text-slate-300">
                {isLoading ? "—" : `${totalProducts} products`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Product Form
// ─────────────────────────────────────────────────────────────────────────────

function AddProductForm({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    const priceNum = Number.parseFloat(form.price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    setSubmitting(true);
    try {
      addAdminProduct({
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        price: priceNum,
        imageUrl: form.imageUrl.trim(),
        featured: form.featured,
        stockAvailable: form.stockAvailable,
      });
      toast.success(`"${form.name}" added successfully`);
      setForm(EMPTY_FORM);
      onAdded();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border border-slate-700/50 bg-slate-800/60">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base flex items-center gap-2 text-amber-400">
          <Plus className="w-4 h-4" />
          Add New Product
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="product-name"
                className="font-body text-sm font-medium text-slate-300"
              >
                Product Name *
              </Label>
              <Input
                id="product-name"
                data-ocid="shopkeeper.product_name_input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Paracetamol 500mg"
                className="font-body bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="product-category"
                className="font-body text-sm font-medium text-slate-300"
              >
                Category *
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as Category }))
                }
              >
                <SelectTrigger
                  id="product-category"
                  data-ocid="shopkeeper.product_category_select"
                  className="font-body bg-slate-700/60 border-slate-600 text-white"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="font-body"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="product-price"
                className="font-body text-sm font-medium text-slate-300"
              >
                Price (₹) *
              </Label>
              <Input
                id="product-price"
                data-ocid="shopkeeper.product_price_input"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="e.g. 45"
                className="font-body bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="product-image"
                className="font-body text-sm font-medium text-slate-300"
              >
                Image URL{" "}
                <span className="text-slate-500 font-normal">(optional)</span>
              </Label>
              <Input
                id="product-image"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://... or /assets/..."
                className="font-body bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="product-description"
              className="font-body text-sm font-medium text-slate-300"
            >
              Description
            </Label>
            <Textarea
              id="product-description"
              data-ocid="shopkeeper.product_description_textarea"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Brief product description..."
              className="font-body resize-none bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500"
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="product-featured"
                checked={form.featured}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, featured: !!checked }))
                }
                className="border-slate-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <Label
                htmlFor="product-featured"
                className="font-body text-sm cursor-pointer text-slate-300"
              >
                Featured product
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="product-stock"
                checked={form.stockAvailable}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, stockAvailable: !!checked }))
                }
                className="border-slate-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              <Label
                htmlFor="product-stock"
                className="font-body text-sm cursor-pointer text-slate-300"
              >
                In Stock
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            data-ocid="shopkeeper.add_product_button"
            disabled={submitting}
            className="font-body font-semibold gap-2 w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-900 border-0"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Product
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Table
// ─────────────────────────────────────────────────────────────────────────────

function ProductTable({
  products,
  stockOverrides,
  adminProductIds,
  onToggleStock,
  onDelete,
}: {
  products: Product[];
  stockOverrides: Record<string, boolean>;
  adminProductIds: Set<number>;
  onToggleStock: (id: string, current: boolean) => void;
  onDelete: (id: number) => void;
}) {
  if (products.length === 0) {
    return (
      <div
        data-ocid="shopkeeper.product.empty_state"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <Package className="w-10 h-10 text-slate-600 mb-3" />
        <p className="font-body text-slate-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table data-ocid="shopkeeper.product.table">
        <TableHeader>
          <TableRow className="border-slate-700/50 hover:bg-transparent">
            <TableHead className="font-body text-xs text-slate-400 w-14">
              Image
            </TableHead>
            <TableHead className="font-body text-xs text-slate-400">
              Name
            </TableHead>
            <TableHead className="font-body text-xs text-slate-400 hidden md:table-cell">
              Category
            </TableHead>
            <TableHead className="font-body text-xs text-slate-400 hidden sm:table-cell">
              Price
            </TableHead>
            <TableHead className="font-body text-xs text-slate-400">
              Stock
            </TableHead>
            <TableHead className="font-body text-xs text-slate-400 hidden sm:table-cell">
              Featured
            </TableHead>
            <TableHead className="font-body text-xs text-slate-400 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, idx) => {
            const idStr = String(product.id);
            const isAdmin = adminProductIds.has(Number(product.id));
            const stockOverride = stockOverrides[idStr];
            const effectiveStock =
              stockOverride !== undefined
                ? stockOverride
                : product.stockAvailable;
            const rowIndex = idx + 1;

            return (
              <TableRow
                key={idStr}
                data-ocid={`shopkeeper.product.row.${rowIndex}`}
                className="border-slate-700/30 hover:bg-slate-800/40"
              >
                <TableCell>
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-md border border-slate-700/50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://placehold.co/80x80/1e293b/94a3b8?text=${encodeURIComponent(product.name.slice(0, 2))}`;
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-body text-sm font-medium truncate max-w-[140px] md:max-w-[220px] text-slate-200">
                      {product.name}
                    </span>
                    {isAdmin && (
                      <Badge
                        variant="outline"
                        className="font-body text-[10px] shrink-0 border-amber-500/50 text-amber-400"
                      >
                        Custom
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="font-body text-xs text-slate-500">
                    {getCategoryLabel(product.category)}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="font-body text-sm font-semibold text-emerald-400">
                    ₹{product.price.toFixed(0)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    data-ocid={`shopkeeper.stock_toggle.${rowIndex}`}
                    onClick={() => onToggleStock(idStr, effectiveStock)}
                    className={`font-body text-xs gap-1.5 h-7 px-2 transition-colors border ${
                      effectiveStock
                        ? "border-emerald-500/50 text-emerald-400 bg-emerald-400/5 hover:bg-emerald-400/10"
                        : "border-red-500/50 text-red-400 bg-red-400/5 hover:bg-red-400/10"
                    }`}
                  >
                    {effectiveStock ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">In Stock</span>
                      </>
                    ) : (
                      <>
                        <PackageX className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Out of Stock</span>
                      </>
                    )}
                  </Button>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {product.featured ? (
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isAdmin ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      data-ocid={`shopkeeper.delete_button.${rowIndex}`}
                      onClick={() => onDelete(Number(product.id))}
                      className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-400 text-slate-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sr-only">Delete {product.name}</span>
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-600 px-2">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Payments Tab Content
// ─────────────────────────────────────────────────────────────────────────────

function PaymentsContent({ isInitialized }: { isInitialized: boolean }) {
  const {
    data: pendingOrders = [],
    isLoading,
    refetch,
  } = useGetPendingPaymentOrders(isInitialized);
  const confirmPayment = useConfirmPayment();
  const rejectPayment = useRejectPayment();

  const formatDate = (timestamp: bigint) => {
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleConfirm = async (order: Order) => {
    try {
      await confirmPayment.mutateAsync(order.orderId);
      toast.success(`Payment confirmed for Order #${order.orderId}`);
      refetch();
    } catch {
      toast.error("Failed to confirm payment. Please try again.");
    }
  };

  const handleReject = async (order: Order) => {
    try {
      await rejectPayment.mutateAsync(order.orderId);
      toast.error(`Payment rejected for Order #${order.orderId}`);
      refetch();
    } catch {
      toast.error("Failed to reject payment. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div
        data-ocid="shopkeeper.payments.loading_state"
        className="flex items-center justify-center py-16 gap-3"
      >
        <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
        <span className="font-body text-sm text-slate-500">
          Loading pending payments…
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 max-w-sm">
        <Card className="border border-slate-700/50 bg-slate-800/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-amber-400/10">
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-body text-xs text-slate-400">Pending</p>
              <p className="font-heading font-bold text-xl leading-none text-amber-400">
                {pendingOrders.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-700/50 bg-slate-800/60 overflow-hidden">
        <CardHeader className="pb-3 px-5 pt-4">
          <CardTitle className="font-heading text-base flex items-center gap-2 text-amber-400">
            <CreditCard className="w-4 h-4" />
            Payments Awaiting Verification
          </CardTitle>
        </CardHeader>
        {pendingOrders.length === 0 ? (
          <div
            data-ocid="shopkeeper.payments.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center gap-3 px-4"
          >
            <CheckCircle2 className="w-10 h-10 text-slate-600" />
            <p className="font-body text-slate-500">No pending payments</p>
            <p className="font-body text-xs text-slate-600">
              All payments have been verified
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="shopkeeper.payments.table">
              <TableHeader>
                <TableRow className="border-slate-700/50 hover:bg-transparent">
                  <TableHead className="font-body text-xs text-slate-400">
                    Order ID
                  </TableHead>
                  <TableHead className="font-body text-xs text-slate-400">
                    Customer
                  </TableHead>
                  <TableHead className="font-body text-xs text-slate-400 hidden md:table-cell">
                    Phone
                  </TableHead>
                  <TableHead className="font-body text-xs text-slate-400">
                    Amount
                  </TableHead>
                  <TableHead className="font-body text-xs text-slate-400">
                    Transaction ID
                  </TableHead>
                  <TableHead className="font-body text-xs text-slate-400 hidden lg:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="font-body text-xs text-slate-400 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.map((order, idx) => {
                  const rowIndex = idx + 1;
                  return (
                    <TableRow
                      key={String(order.orderId)}
                      data-ocid={`shopkeeper.payments.row.${rowIndex}`}
                      className="border-slate-700/30 hover:bg-slate-800/40"
                    >
                      <TableCell>
                        <span className="font-body text-xs font-mono text-slate-500">
                          #{String(order.orderId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-body text-sm font-medium text-slate-200 truncate max-w-[100px] block">
                          {order.customerName}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-body text-sm text-slate-400">
                          {order.phoneNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-body text-sm font-semibold text-emerald-400">
                          ₹{order.totalPrice.toFixed(0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.transactionId ? (
                          <span className="font-body text-xs font-mono bg-slate-700/60 px-2 py-0.5 rounded text-slate-300">
                            {order.transactionId}
                          </span>
                        ) : (
                          <Badge
                            variant="outline"
                            className="font-body text-[10px] border-amber-500/50 text-amber-400"
                          >
                            Not submitted
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="font-body text-xs text-slate-500">
                          {formatDate(order.timestamp)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            data-ocid={`shopkeeper.payments.confirm_button.${rowIndex}`}
                            onClick={() => handleConfirm(order)}
                            disabled={
                              confirmPayment.isPending ||
                              rejectPayment.isPending
                            }
                            className="font-body text-xs gap-1.5 h-7 px-2 bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                          >
                            {confirmPayment.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">Confirm</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            data-ocid={`shopkeeper.payments.reject_button.${rowIndex}`}
                            onClick={() => handleReject(order)}
                            disabled={
                              confirmPayment.isPending ||
                              rejectPayment.isPending
                            }
                            className="font-body text-xs gap-1.5 h-7 px-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            {rejectPayment.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">Reject</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Orders & Revenue Content
// ─────────────────────────────────────────────────────────────────────────────

function OrdersContent({
  orders,
  products,
  isLoading,
}: {
  orders: Order[];
  products: Product[];
  isLoading: boolean;
}) {
  const productMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      map.set(String(p.id), p.name);
    }
    return map;
  }, [products]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.totalPrice, 0),
    [orders],
  );

  const totalItemsSold = useMemo(
    () =>
      orders.reduce(
        (sum, o) =>
          sum + o.items.reduce((s, item) => s + Number(item.quantity), 0),
        0,
      ),
    [orders],
  );

  if (isLoading) {
    return (
      <div data-ocid="shopkeeper.orders.loading_state" className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-slate-800/60" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl bg-slate-800/60" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Card className="border border-slate-700/50 bg-slate-800/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-blue-400/10">
              <ClipboardList className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="font-body text-xs text-slate-400">Total Orders</p>
              <p className="font-heading font-bold text-xl leading-none text-blue-400">
                {orders.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-700/50 bg-slate-800/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-amber-400/10">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-body text-xs text-slate-400">Total Revenue</p>
              <p className="font-heading font-bold text-xl leading-none text-amber-400">
                ₹{totalRevenue.toFixed(0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-700/50 bg-slate-800/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-purple-400/10">
              <ShoppingBag className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="font-body text-xs text-slate-400">Items Sold</p>
              <p className="font-heading font-bold text-xl leading-none text-purple-400">
                {totalItemsSold}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-700/50 bg-slate-800/60 overflow-hidden">
        <CardHeader className="pb-3 px-5 pt-4">
          <CardTitle className="font-heading text-base flex items-center gap-2 text-amber-400">
            <ClipboardList className="w-4 h-4" />
            Confirmed Orders
          </CardTitle>
        </CardHeader>
        {orders.length === 0 ? (
          <div
            data-ocid="shopkeeper.orders.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center gap-3"
          >
            <ClipboardList className="w-10 h-10 text-slate-600" />
            <p className="font-body text-slate-500">No confirmed orders yet</p>
            <p className="font-body text-xs text-slate-600">
              Orders will appear here once payment is verified
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="shopkeeper.orders.table">
              <TableHeader>
                <TableRow className="border-slate-700/50 hover:bg-transparent">
                  <TableHead className="font-body text-xs text-slate-400">
                    Order ID
                  </TableHead>
                  <TableHead className="font-body text-xs text-slate-400">
                    Customer
                  </TableHead>
                  <TableHead className="font-body text-xs text-slate-400 hidden md:table-cell">
                    Phone
                  </TableHead>
                  <TableHead className="font-body text-xs text-slate-400 hidden lg:table-cell">
                    Address
                  </TableHead>
                  <TableHead className="font-body text-xs text-slate-400">
                    Items
                  </TableHead>
                  <TableHead className="font-body text-xs text-slate-400">
                    Total
                  </TableHead>
                  <TableHead className="font-body text-xs text-slate-400 hidden md:table-cell">
                    Date & Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, idx) => {
                  const rowIndex = idx + 1;
                  const orderDate = new Date(
                    Number(order.timestamp) / 1_000_000,
                  );
                  const formattedDate = orderDate.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const formattedTime = orderDate.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <TableRow
                      key={String(order.orderId)}
                      data-ocid={`shopkeeper.orders.row.${rowIndex}`}
                      className="border-slate-700/30 hover:bg-slate-800/40"
                    >
                      <TableCell>
                        <span className="font-body text-xs font-mono text-slate-500">
                          #{String(order.orderId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-body text-sm font-medium text-slate-200 truncate max-w-[100px] block">
                          {order.customerName}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-body text-sm text-slate-400">
                          {order.phoneNumber}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="font-body text-xs text-slate-500 line-clamp-2 max-w-[150px]">
                          {order.address.line1}, {order.address.city},{" "}
                          {order.address.pincode}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 max-w-[160px]">
                          {order.items.map((item) => {
                            const productName =
                              productMap.get(String(item.productId)) ??
                              `Product #${String(item.productId)}`;
                            return (
                              <span
                                key={String(item.productId)}
                                className="font-body text-xs text-slate-500 truncate"
                              >
                                {productName} ×{Number(item.quantity)}
                              </span>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-body text-sm font-semibold text-emerald-400">
                          ₹{order.totalPrice.toFixed(0)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="font-body text-xs text-slate-500">
                          <div>{formattedDate}</div>
                          <div>{formattedTime}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sell Content
// ─────────────────────────────────────────────────────────────────────────────

function SellContent({
  products,
  orders,
  isLoadingProducts,
}: {
  products: Product[];
  orders: Order[];
  isLoadingProducts: boolean;
}) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [supplierNote, setSupplierNote] = useState<string>("");

  const placeOrder = usePlaceOrder();

  const salesHistory = useMemo(
    () => orders.filter((o) => o.customerName === "Supplier Sale").reverse(),
    [orders],
  );

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }
    const qty = Number.parseInt(quantity, 10);
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      const result = await placeOrder.mutateAsync({
        customerName: "Supplier Sale",
        phoneNumber: "0000000000",
        address: {
          line1: "Supplier Warehouse",
          city: "Local",
          pincode: "000000",
        },
        prescriptionNote: supplierNote.trim() || undefined,
        items: [
          {
            productId: BigInt(selectedProductId),
            quantity: BigInt(qty),
          },
        ],
      });

      toast.success(`Sale recorded! Order ID: #${result.orderId.toString()}`);
      setSelectedProductId("");
      setQuantity("1");
      setSupplierNote("");
    } catch {
      toast.error("Failed to record sale. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-700/50 bg-slate-800/60">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base flex items-center gap-2 text-amber-400">
            <ShoppingBag className="w-4 h-4" />
            Quick Sell
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSell} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="sell-product"
                  className="font-body text-sm font-medium text-slate-300"
                >
                  Product *
                </Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  disabled={isLoadingProducts}
                >
                  <SelectTrigger
                    id="sell-product"
                    data-ocid="shopkeeper.sell.product_select"
                    className="font-body bg-slate-700/60 border-slate-600 text-white"
                  >
                    <SelectValue
                      placeholder={
                        isLoadingProducts
                          ? "Loading products..."
                          : "Select a product"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem
                        key={String(p.id)}
                        value={String(p.id)}
                        className="font-body"
                      >
                        {p.name} — ₹{p.price.toFixed(0)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="sell-quantity"
                  className="font-body text-sm font-medium text-slate-300"
                >
                  Quantity *
                </Label>
                <Input
                  id="sell-quantity"
                  data-ocid="shopkeeper.sell.quantity_input"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="font-body bg-slate-700/60 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="sell-note"
                className="font-body text-sm font-medium text-slate-300"
              >
                Note{" "}
                <span className="text-slate-500 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="sell-note"
                data-ocid="shopkeeper.sell.note_textarea"
                value={supplierNote}
                onChange={(e) => setSupplierNote(e.target.value)}
                placeholder="Add any notes about this sale..."
                className="font-body resize-none bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500"
                rows={2}
              />
            </div>

            <Button
              type="submit"
              data-ocid="shopkeeper.sell.submit_button"
              disabled={placeOrder.isPending}
              className="font-body font-semibold gap-2 w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-900 border-0"
            >
              {placeOrder.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
              {placeOrder.isPending ? "Recording Sale..." : "Record Sale"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-heading font-semibold text-base text-white mb-3">
          Sales History
        </h3>
        {salesHistory.length === 0 ? (
          <Card className="border border-slate-700/50 bg-slate-800/40">
            <div
              data-ocid="shopkeeper.sell.empty_state"
              className="flex flex-col items-center justify-center py-10 text-center gap-2"
            >
              <ShoppingBag className="w-8 h-8 text-slate-600" />
              <p className="font-body text-sm text-slate-500">
                No sales recorded yet
              </p>
            </div>
          </Card>
        ) : (
          <div data-ocid="shopkeeper.sell.list" className="space-y-2">
            {salesHistory.map((order, idx) => {
              const itemIdx = idx + 1;
              const orderDate = new Date(Number(order.timestamp) / 1_000_000);
              const formatted = orderDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              return (
                <Card
                  key={String(order.orderId)}
                  data-ocid={`shopkeeper.sell.item.${itemIdx}`}
                  className="border border-slate-700/50 bg-slate-800/40"
                >
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-body text-xs font-mono text-slate-500">
                          #{String(order.orderId)}
                        </span>
                        <Badge
                          variant="outline"
                          className="font-body text-[10px] border-emerald-500/50 text-emerald-400"
                        >
                          Sale
                        </Badge>
                        <span className="font-body text-xs text-slate-500">
                          {formatted}
                        </span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {order.items.map((item, i) => (
                          <span
                            key={String(item.productId)}
                            className="font-body text-xs text-slate-500"
                          >
                            {i > 0 ? "· " : ""}
                            Item #{String(item.productId)} ×
                            {Number(item.quantity)}
                          </span>
                        ))}
                      </div>
                      {order.prescriptionNote && (
                        <p className="font-body text-xs text-slate-500 italic mt-0.5 truncate max-w-xs">
                          Note: {order.prescriptionNote}
                        </p>
                      )}
                    </div>
                    <span className="font-body font-semibold text-sm shrink-0 text-emerald-400">
                      ₹{order.totalPrice.toFixed(0)}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Components (route-level)
// ─────────────────────────────────────────────────────────────────────────────

function DashboardPage() {
  useEffect(() => {
    document.title = "Dashboard | Shopkeeper — Venkateshwara Medicals";
  }, []);

  const {
    totalProducts,
    outOfStockCount,
    pendingOrders,
    confirmedOrders,
    totalRevenue,
    isLoading,
    isLoadingOrders,
  } = useShopkeeperData();

  return (
    <OverviewContent
      totalProducts={totalProducts}
      outOfStockCount={outOfStockCount}
      pendingPayments={pendingOrders.length}
      confirmedOrders={confirmedOrders.length}
      totalRevenue={totalRevenue}
      isLoading={isLoading || isLoadingOrders}
    />
  );
}

function ProductsPage() {
  useEffect(() => {
    document.title = "Products | Shopkeeper — Venkateshwara Medicals";
  }, []);

  const {
    allProducts,
    adminProductIds,
    stockOverrides,
    isLoading,
    outOfStockCount,
    totalProducts,
    refreshAdminData,
    handleToggleStock,
    handleDelete,
  } = useShopkeeperData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-white mb-1">
          Products
        </h1>
        <p className="font-body text-sm text-slate-400">
          Manage your product catalogue and stock status.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border border-slate-700/50 bg-slate-800/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-emerald-400/10">
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="font-body text-xs text-slate-400">Total Products</p>
              <p className="font-heading font-bold text-xl leading-none text-emerald-400">
                {isLoading ? "—" : totalProducts}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-700/50 bg-slate-800/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-red-400/10">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="font-body text-xs text-slate-400">Out of Stock</p>
              <p className="font-heading font-bold text-xl leading-none text-red-400">
                {isLoading ? "—" : outOfStockCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-700/50 bg-slate-800/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-amber-400/10">
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-body text-xs text-slate-400">Featured</p>
              <p className="font-heading font-bold text-xl leading-none text-amber-400">
                {isLoading ? "—" : allProducts.filter((p) => p.featured).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddProductForm onAdded={refreshAdminData} />

      <Separator className="bg-slate-700/50" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg text-white">
            All Products
          </h2>
          <span className="font-body text-xs text-slate-500">
            Click stock badge to toggle
          </span>
        </div>

        <Card className="border border-slate-700/50 bg-slate-800/60 overflow-hidden">
          {isLoading ? (
            <div
              data-ocid="shopkeeper.product.loading_state"
              className="flex items-center justify-center py-16 gap-3"
            >
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              <span className="font-body text-sm text-slate-500">
                Loading products…
              </span>
            </div>
          ) : (
            <ProductTable
              products={allProducts}
              stockOverrides={stockOverrides}
              adminProductIds={adminProductIds}
              onToggleStock={handleToggleStock}
              onDelete={handleDelete}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

function PaymentsPage() {
  useEffect(() => {
    document.title = "Payments | Shopkeeper — Venkateshwara Medicals";
  }, []);

  const { isInitialized } = useShopkeeperData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-white mb-1">
          Payments
        </h1>
        <p className="font-body text-sm text-slate-400">
          Verify and manage customer payments.
        </p>
      </div>
      <PaymentsContent isInitialized={isInitialized} />
    </div>
  );
}

function OrdersPage() {
  useEffect(() => {
    document.title = "Orders | Shopkeeper — Venkateshwara Medicals";
  }, []);

  const { confirmedOrders, allProducts, isLoading, isLoadingOrders } =
    useShopkeeperData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-white mb-1">
          Orders & Revenue
        </h1>
        <p className="font-body text-sm text-slate-400">
          View all confirmed orders and revenue analytics.
        </p>
      </div>
      <OrdersContent
        orders={confirmedOrders}
        products={allProducts}
        isLoading={isLoadingOrders || isLoading}
      />
    </div>
  );
}

function SellPage() {
  useEffect(() => {
    document.title = "Sell | Shopkeeper — Venkateshwara Medicals";
  }, []);

  const { allProducts, confirmedOrders, isLoading } = useShopkeeperData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-white mb-1">
          Sell
        </h1>
        <p className="font-body text-sm text-slate-400">
          Record quick in-store sales.
        </p>
      </div>
      <SellContent
        products={allProducts}
        orders={confirmedOrders}
        isLoadingProducts={isLoading}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Router setup (for the shopkeeper sub-app)
// ─────────────────────────────────────────────────────────────────────────────

function createShopkeeperRouter(onLogout: () => void) {
  const rootRoute = createRootRoute({
    component: () => <ShopkeeperLayout onLogout={onLogout} />,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: DashboardPage,
  });

  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/dashboard",
    component: DashboardPage,
  });

  const productsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/products",
    component: ProductsPage,
  });

  const paymentsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/payments",
    component: PaymentsPage,
  });

  const ordersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/orders",
    component: OrdersPage,
  });

  const sellRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/sell",
    component: SellPage,
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    dashboardRoute,
    productsRoute,
    paymentsRoute,
    ordersRoute,
    sellRoute,
  ]);

  return createRouter({ routeTree });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ShopkeeperApp export
// ─────────────────────────────────────────────────────────────────────────────

const shopkeeperQueryClient = new QueryClient();

type PortalView = "landing" | "pin" | "portal";

export default function ShopkeeperApp() {
  const [view, setView] = useState<PortalView>(() =>
    sessionStorage.getItem(SESSION_KEY) === "1" ? "portal" : "landing",
  );

  // Create the router lazily once we need it, and recreate on logout
  const [router] = useState(() =>
    createShopkeeperRouter(() => {
      sessionStorage.removeItem(SESSION_KEY);
      setView("landing");
    }),
  );

  if (view === "landing") {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <ShopkeeperLanding onEnter={() => setView("pin")} />
      </ThemeProvider>
    );
  }

  if (view === "pin") {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <PinGate
          onUnlock={() => setView("portal")}
          onBack={() => setView("landing")}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={shopkeeperQueryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
