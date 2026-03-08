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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  CreditCard,
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
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Order } from "../backend";
import { Category, type Product } from "../backend";
import {
  useConfirmPayment,
  useGetAllProducts,
  useGetConfirmedOrders,
  useGetPendingPaymentOrders,
  useInitialize,
  usePlaceOrder,
  useRejectPayment,
} from "../hooks/useQueries";
import {
  addAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  getStockOverrides,
  setStockOverride,
} from "../lib/adminOverrides";
import { getCategoryLabel, getProductImageUrl } from "../lib/productUtils";

const ADMIN_PIN = "admin123";

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

// ── PIN Gate ──────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onUnlock();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-800 p-4">
      <Card
        className={`w-full max-w-sm shadow-2xl border-0 bg-white/95 backdrop-blur-sm transition-transform ${shaking ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
      >
        <CardHeader className="text-center pb-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: "#1a6b3c" }}
          >
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="font-heading text-xl text-foreground">
            Shopkeeper Access
          </CardTitle>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Enter your PIN to access the Shopkeeper Panel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pin-input" className="font-body text-sm">
                PIN
              </Label>
              <Input
                id="pin-input"
                data-ocid="admin.pin_input"
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Enter admin PIN"
                autoFocus
                className={`font-body text-center tracking-widest text-lg ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {error && (
                <p
                  data-ocid="admin.pin.error_state"
                  className="font-body text-xs text-destructive flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Incorrect PIN. Please try again.
                </p>
              )}
            </div>
            <Button
              type="submit"
              data-ocid="admin.pin_submit_button"
              className="w-full font-body font-semibold gap-2"
              style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
            >
              <Lock className="w-4 h-4" />
              Unlock Shopkeeper Panel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({
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
      ocid: "admin.overview.total_products_card",
      label: "Total Products",
      value: isLoading ? "—" : String(totalProducts),
      icon: <Package className="w-5 h-5" style={{ color: "#1a6b3c" }} />,
      bg: "#e8f5ee",
      color: "#1a6b3c",
    },
    {
      ocid: "admin.overview.out_of_stock_card",
      label: "Out of Stock",
      value: isLoading ? "—" : String(outOfStockCount),
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      bg: "#fef2f2",
      color: "#dc2626",
    },
    {
      ocid: "admin.overview.pending_payments_card",
      label: "Pending Payments",
      value: isLoading ? "—" : String(pendingPayments),
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
      bg: "#fffbeb",
      color: "#d97706",
    },
    {
      ocid: "admin.overview.confirmed_orders_card",
      label: "Confirmed Orders",
      value: isLoading ? "—" : String(confirmedOrders),
      icon: <ClipboardList className="w-5 h-5" style={{ color: "#1a6b3c" }} />,
      bg: "#e8f5ee",
      color: "#1a6b3c",
    },
    {
      ocid: "admin.overview.revenue_card",
      label: "Total Revenue",
      value: isLoading ? "—" : `₹${totalRevenue.toFixed(0)}`,
      icon: <IndianRupee className="w-5 h-5" style={{ color: "#c8a84b" }} />,
      bg: "#fdf8ed",
      color: "#c8a84b",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-xl text-foreground mb-1">
          Dashboard Overview
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          All store metrics in one place — products, payments, orders, and
          revenue.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <Card
            key={stat.ocid}
            data-ocid={stat.ocid}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4 flex flex-col gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: stat.bg }}
              >
                {stat.icon}
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground leading-tight">
                  {stat.label}
                </p>
                <p
                  className="font-heading font-bold text-2xl leading-tight mt-0.5"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick status grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle
              className="font-heading text-sm flex items-center gap-2"
              style={{ color: "#1a6b3c" }}
            >
              <TrendingUp className="w-4 h-4" />
              Revenue Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-muted-foreground">
                Confirmed Orders
              </span>
              <span
                className="font-body text-sm font-semibold"
                style={{ color: "#1a6b3c" }}
              >
                {isLoading ? "—" : confirmedOrders}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-muted-foreground">
                Total Revenue
              </span>
              <span
                className="font-body text-sm font-semibold"
                style={{ color: "#c8a84b" }}
              >
                {isLoading ? "—" : `₹${totalRevenue.toFixed(0)}`}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-muted-foreground">
                Avg Order Value
              </span>
              <span className="font-body text-sm font-semibold text-foreground">
                {isLoading || confirmedOrders === 0
                  ? "—"
                  : `₹${(totalRevenue / confirmedOrders).toFixed(0)}`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle
              className="font-heading text-sm flex items-center gap-2"
              style={{ color: "#1a6b3c" }}
            >
              <ShieldAlert className="w-4 h-4" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-muted-foreground">
                Payments to verify
              </span>
              <Badge
                variant="outline"
                className={`font-body text-xs ${pendingPayments > 0 ? "border-amber-400 text-amber-700 bg-amber-50" : "border-green-400 text-green-700 bg-green-50"}`}
              >
                {isLoading
                  ? "—"
                  : pendingPayments > 0
                    ? `${pendingPayments} pending`
                    : "All clear"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-muted-foreground">
                Products out of stock
              </span>
              <Badge
                variant="outline"
                className={`font-body text-xs ${outOfStockCount > 0 ? "border-red-400 text-red-700 bg-red-50" : "border-green-400 text-green-700 bg-green-50"}`}
              >
                {isLoading
                  ? "—"
                  : outOfStockCount > 0
                    ? `${outOfStockCount} items`
                    : "All stocked"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-muted-foreground">
                Total catalogue
              </span>
              <span className="font-body text-sm font-semibold text-foreground">
                {isLoading ? "—" : `${totalProducts} products`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Add Product Form ──────────────────────────────────────────────────────────
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
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle
          className="font-heading text-base flex items-center gap-2"
          style={{ color: "#1a6b3c" }}
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="product-name"
                className="font-body text-sm font-medium"
              >
                Product Name *
              </Label>
              <Input
                id="product-name"
                data-ocid="admin.product_name_input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Paracetamol 500mg"
                className="font-body"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label
                htmlFor="product-category"
                className="font-body text-sm font-medium"
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
                  data-ocid="admin.product_category_select"
                  className="font-body"
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

            {/* Price */}
            <div className="space-y-1.5">
              <Label
                htmlFor="product-price"
                className="font-body text-sm font-medium"
              >
                Price (₹) *
              </Label>
              <Input
                id="product-price"
                data-ocid="admin.product_price_input"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="e.g. 45"
                className="font-body"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label
                htmlFor="product-image"
                className="font-body text-sm font-medium"
              >
                Image URL{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="product-image"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://... or /assets/..."
                className="font-body"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="product-description"
              className="font-body text-sm font-medium"
            >
              Description
            </Label>
            <Textarea
              id="product-description"
              data-ocid="admin.product_description_textarea"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Brief product description..."
              className="font-body resize-none"
              rows={3}
            />
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="product-featured"
                checked={form.featured}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, featured: !!checked }))
                }
              />
              <Label
                htmlFor="product-featured"
                className="font-body text-sm cursor-pointer"
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
              />
              <Label
                htmlFor="product-stock"
                className="font-body text-sm cursor-pointer"
              >
                In Stock
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            data-ocid="admin.add_product_button"
            disabled={submitting}
            className="font-body font-semibold gap-2 w-full sm:w-auto"
            style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
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

// ── Product Table ─────────────────────────────────────────────────────────────
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
        data-ocid="admin.product.empty_state"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <Package className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="font-body text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table data-ocid="admin.product.table">
        <TableHeader>
          <TableRow>
            <TableHead className="font-body text-xs w-14">Image</TableHead>
            <TableHead className="font-body text-xs">Name</TableHead>
            <TableHead className="font-body text-xs hidden md:table-cell">
              Category
            </TableHead>
            <TableHead className="font-body text-xs hidden sm:table-cell">
              Price
            </TableHead>
            <TableHead className="font-body text-xs">Stock</TableHead>
            <TableHead className="font-body text-xs hidden sm:table-cell">
              Featured
            </TableHead>
            <TableHead className="font-body text-xs text-right">
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
                data-ocid={`admin.product.row.${rowIndex}`}
                className="hover:bg-muted/40"
              >
                {/* Thumbnail */}
                <TableCell>
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-md border border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://placehold.co/80x80/e8f5ee/1a6b3c?text=${encodeURIComponent(product.name.slice(0, 2))}`;
                    }}
                  />
                </TableCell>

                {/* Name */}
                <TableCell>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-body text-sm font-medium truncate max-w-[140px] md:max-w-[220px]">
                      {product.name}
                    </span>
                    {isAdmin && (
                      <Badge
                        variant="outline"
                        className="font-body text-[10px] shrink-0 border-amber-400 text-amber-600"
                      >
                        Admin
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell className="hidden md:table-cell">
                  <span className="font-body text-xs text-muted-foreground">
                    {getCategoryLabel(product.category)}
                  </span>
                </TableCell>

                {/* Price */}
                <TableCell className="hidden sm:table-cell">
                  <span
                    className="font-body text-sm font-semibold"
                    style={{ color: "#1a6b3c" }}
                  >
                    ₹{product.price.toFixed(0)}
                  </span>
                </TableCell>

                {/* Stock toggle */}
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    data-ocid={`admin.stock_toggle.${rowIndex}`}
                    onClick={() => onToggleStock(idStr, effectiveStock)}
                    className={`font-body text-xs gap-1.5 h-7 px-2 transition-colors ${
                      effectiveStock
                        ? "border-green-500 text-green-700 hover:bg-green-50"
                        : "border-red-400 text-red-600 hover:bg-red-50"
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

                {/* Featured */}
                <TableCell className="hidden sm:table-cell">
                  {product.featured ? (
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  {isAdmin ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      data-ocid={`admin.delete_button.${rowIndex}`}
                      onClick={() => onDelete(Number(product.id))}
                      className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sr-only">Delete {product.name}</span>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground px-2">
                      —
                    </span>
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

// ── Payments Tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ isInitialized }: { isInitialized: boolean }) {
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
        data-ocid="admin.payments.loading_state"
        className="flex items-center justify-center py-16 gap-3"
      >
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="font-body text-sm text-muted-foreground">
          Loading pending payments…
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 max-w-sm">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#fffbeb" }}
            >
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground">Pending</p>
              <p className="font-heading font-bold text-xl leading-none text-amber-600">
                {pendingOrders.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments Table */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-3 px-5 pt-4">
          <CardTitle
            className="font-heading text-base flex items-center gap-2"
            style={{ color: "#1a6b3c" }}
          >
            <CreditCard className="w-4 h-4" />
            Payments Awaiting Verification
          </CardTitle>
        </CardHeader>
        {pendingOrders.length === 0 ? (
          <div
            data-ocid="admin.payments.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center gap-3 px-4"
          >
            <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
            <p className="font-body text-muted-foreground">
              No pending payments
            </p>
            <p className="font-body text-xs text-muted-foreground">
              All payments have been verified
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="admin.payments.table">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body text-xs">Order ID</TableHead>
                  <TableHead className="font-body text-xs">Customer</TableHead>
                  <TableHead className="font-body text-xs hidden md:table-cell">
                    Phone
                  </TableHead>
                  <TableHead className="font-body text-xs">Amount</TableHead>
                  <TableHead className="font-body text-xs">
                    Transaction ID
                  </TableHead>
                  <TableHead className="font-body text-xs hidden lg:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="font-body text-xs text-right">
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
                      data-ocid={`admin.payments.row.${rowIndex}`}
                      className="hover:bg-muted/40"
                    >
                      <TableCell>
                        <span className="font-body text-xs font-mono text-muted-foreground">
                          #{String(order.orderId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-body text-sm font-medium truncate max-w-[100px] block">
                          {order.customerName}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-body text-sm text-muted-foreground">
                          {order.phoneNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="font-body text-sm font-semibold"
                          style={{ color: "#1a6b3c" }}
                        >
                          ₹{order.totalPrice.toFixed(0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.transactionId ? (
                          <span className="font-body text-xs font-mono bg-muted px-2 py-0.5 rounded">
                            {order.transactionId}
                          </span>
                        ) : (
                          <Badge
                            variant="outline"
                            className="font-body text-[10px] border-amber-400 text-amber-600"
                          >
                            Not submitted
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="font-body text-xs text-muted-foreground">
                          {formatDate(order.timestamp)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            data-ocid={`admin.payments.confirm_button.${rowIndex}`}
                            onClick={() => handleConfirm(order)}
                            disabled={
                              confirmPayment.isPending ||
                              rejectPayment.isPending
                            }
                            className="font-body text-xs gap-1.5 h-7 px-2 bg-green-600 hover:bg-green-700 text-white border-0"
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
                            data-ocid={`admin.payments.reject_button.${rowIndex}`}
                            onClick={() => handleReject(order)}
                            disabled={
                              confirmPayment.isPending ||
                              rejectPayment.isPending
                            }
                            className="font-body text-xs gap-1.5 h-7 px-2 border-red-400 text-red-600 hover:bg-red-50"
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

// ── Orders & Revenue Tab ──────────────────────────────────────────────────────
function OrdersRevenueTab({
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
      <div data-ocid="admin.orders.loading_state" className="space-y-4 p-2">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#e8f5ee" }}
            >
              <ClipboardList className="w-4 h-4" style={{ color: "#1a6b3c" }} />
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground">
                Total Orders
              </p>
              <p
                className="font-heading font-bold text-xl leading-none"
                style={{ color: "#1a6b3c" }}
              >
                {orders.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#fdf8ed" }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: "#c8a84b" }} />
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground">
                Total Revenue
              </p>
              <p
                className="font-heading font-bold text-xl leading-none"
                style={{ color: "#c8a84b" }}
              >
                ₹{totalRevenue.toFixed(0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-blue-50">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground">
                Items Sold
              </p>
              <p className="font-heading font-bold text-xl leading-none text-blue-600">
                {totalItemsSold}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-3 px-5 pt-4">
          <CardTitle
            className="font-heading text-base flex items-center gap-2"
            style={{ color: "#1a6b3c" }}
          >
            <ClipboardList className="w-4 h-4" />
            Confirmed Orders
          </CardTitle>
        </CardHeader>
        {orders.length === 0 ? (
          <div
            data-ocid="admin.orders.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center gap-3"
          >
            <ClipboardList className="w-10 h-10 text-muted-foreground" />
            <p className="font-body text-muted-foreground">
              No confirmed orders yet
            </p>
            <p className="font-body text-xs text-muted-foreground">
              Orders will appear here once payment is verified
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="admin.orders.table">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body text-xs">Order ID</TableHead>
                  <TableHead className="font-body text-xs">Customer</TableHead>
                  <TableHead className="font-body text-xs hidden md:table-cell">
                    Phone
                  </TableHead>
                  <TableHead className="font-body text-xs hidden lg:table-cell">
                    Address
                  </TableHead>
                  <TableHead className="font-body text-xs">Items</TableHead>
                  <TableHead className="font-body text-xs">Total</TableHead>
                  <TableHead className="font-body text-xs hidden md:table-cell">
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
                      data-ocid={`admin.orders.row.${rowIndex}`}
                      className="hover:bg-muted/40"
                    >
                      <TableCell>
                        <span className="font-body text-xs font-mono text-muted-foreground">
                          #{String(order.orderId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-body text-sm font-medium truncate max-w-[100px] block">
                          {order.customerName}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-body text-sm text-muted-foreground">
                          {order.phoneNumber}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="font-body text-xs text-muted-foreground line-clamp-2 max-w-[150px]">
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
                                className="font-body text-xs text-muted-foreground truncate"
                              >
                                {productName} ×{Number(item.quantity)}
                              </span>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className="font-body text-sm font-semibold"
                          style={{ color: "#1a6b3c" }}
                        >
                          ₹{order.totalPrice.toFixed(0)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="font-body text-xs text-muted-foreground">
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

// ── Sell Tab ──────────────────────────────────────────────────────────────────
function SellTab({
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
      {/* Quick Sell Form */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle
            className="font-heading text-base flex items-center gap-2"
            style={{ color: "#1a6b3c" }}
          >
            <ShoppingBag className="w-4 h-4" />
            Quick Sell
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSell} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Select */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="sell-product"
                  className="font-body text-sm font-medium"
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
                    data-ocid="admin.sell.product_select"
                    className="font-body"
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

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="sell-quantity"
                  className="font-body text-sm font-medium"
                >
                  Quantity *
                </Label>
                <Input
                  id="sell-quantity"
                  data-ocid="admin.sell.quantity_input"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="font-body"
                />
              </div>
            </div>

            {/* Supplier Note */}
            <div className="space-y-1.5">
              <Label
                htmlFor="sell-note"
                className="font-body text-sm font-medium"
              >
                Note{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="sell-note"
                data-ocid="admin.sell.note_textarea"
                value={supplierNote}
                onChange={(e) => setSupplierNote(e.target.value)}
                placeholder="Add any notes about this sale..."
                className="font-body resize-none"
                rows={2}
              />
            </div>

            <Button
              type="submit"
              data-ocid="admin.sell.submit_button"
              disabled={placeOrder.isPending}
              className="font-body font-semibold gap-2 w-full sm:w-auto"
              style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
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

      {/* Sales History */}
      <div>
        <h3 className="font-heading font-semibold text-base text-foreground mb-3">
          Sales History
        </h3>
        {salesHistory.length === 0 ? (
          <Card className="border border-border">
            <div
              data-ocid="admin.sell.empty_state"
              className="flex flex-col items-center justify-center py-10 text-center gap-2"
            >
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              <p className="font-body text-sm text-muted-foreground">
                No sales recorded yet
              </p>
            </div>
          </Card>
        ) : (
          <div data-ocid="admin.sell.list" className="space-y-2">
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
                  data-ocid={`admin.sell.item.${itemIdx}`}
                  className="border border-border"
                >
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-body text-xs font-mono text-muted-foreground">
                          #{String(order.orderId)}
                        </span>
                        <Badge
                          variant="outline"
                          className="font-body text-[10px] border-green-400 text-green-700 shrink-0"
                        >
                          Sale
                        </Badge>
                        <span className="font-body text-xs text-muted-foreground">
                          {formatted}
                        </span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {order.items.map((item, i) => (
                          <span
                            key={String(item.productId)}
                            className="font-body text-xs text-muted-foreground"
                          >
                            {i > 0 ? "· " : ""}
                            Item #{String(item.productId)} ×
                            {Number(item.quantity)}
                          </span>
                        ))}
                      </div>
                      {order.prescriptionNote && (
                        <p className="font-body text-xs text-muted-foreground italic mt-0.5 truncate max-w-xs">
                          Note: {order.prescriptionNote}
                        </p>
                      )}
                    </div>
                    <span
                      className="font-body font-semibold text-sm shrink-0"
                      style={{ color: "#1a6b3c" }}
                    >
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

// ── Main Shopkeeper Panel ─────────────────────────────────────────────────────
export default function AdminPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
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

  // Merge backend products + admin products
  const allProducts = useMemo(() => {
    const base: Product[] = backendProducts ?? [];
    return [...base, ...adminProducts];
  }, [backendProducts, adminProducts]);

  const adminProductIds = useMemo(
    () => new Set(adminProducts.map((p) => Number(p.id))),
    [adminProducts],
  );

  // Refresh admin data from localStorage
  const refreshAdminData = () => {
    setStockOverridesState(getStockOverrides());
    setAdminProductsState(getAdminProducts());
  };

  // Re-read overrides when the page becomes visible (in case of changes)
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

  if (!isUnlocked) {
    return <PinGate onUnlock={() => setIsUnlocked(true)} />;
  }

  // Computed stats
  const totalProducts = allProducts.length;
  const outOfStockCount = allProducts.filter((p) => {
    const override = stockOverrides[String(p.id)];
    return override !== undefined ? !override : !p.stockAvailable;
  }).length;
  const totalRevenue = confirmedOrders.reduce(
    (sum, o) => sum + o.totalPrice,
    0,
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div
        className="sticky top-0 z-10 shadow-sm"
        style={{ backgroundColor: "#0f4526" }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#c8a84b" }}
            >
              <ShieldAlert className="w-4 h-4" style={{ color: "#0f4526" }} />
            </div>
            <div>
              <span className="font-heading font-bold text-white text-sm leading-none">
                Shopkeeper Panel
              </span>
              <p className="font-body text-[10px] text-green-300 leading-none mt-0.5">
                Venkateshwara Medicals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-body text-xs text-green-300 hidden sm:block">
              Logged in as Shopkeeper
            </span>
            <Button
              size="sm"
              variant="ghost"
              data-ocid="admin.logout_button"
              onClick={() => setIsUnlocked(false)}
              className="font-body text-xs gap-1.5 border border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs defaultValue="overview">
          {/* Tab bar — 2-row grid on mobile, single row on md+ */}
          <TabsList className="mb-6 w-full grid grid-cols-3 sm:grid-cols-5 gap-1 h-auto p-1">
            <TabsTrigger
              value="overview"
              data-ocid="admin.overview_tab"
              className="font-body text-xs sm:text-sm gap-1.5 px-2 py-2"
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              data-ocid="admin.products_tab"
              className="font-body text-xs sm:text-sm gap-1.5 px-2 py-2"
            >
              <Package className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Products</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              data-ocid="admin.payments_tab"
              className="font-body text-xs sm:text-sm gap-1.5 px-2 py-2"
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Payments</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              data-ocid="admin.orders_tab"
              className="font-body text-xs sm:text-sm gap-1.5 px-2 py-2"
            >
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              data-ocid="admin.sell_tab"
              className="font-body text-xs sm:text-sm gap-1.5 px-2 py-2 col-span-3 sm:col-span-1"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Sell</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <OverviewTab
              totalProducts={totalProducts}
              outOfStockCount={outOfStockCount}
              pendingPayments={pendingOrders.length}
              confirmedOrders={confirmedOrders.length}
              totalRevenue={totalRevenue}
              isLoading={isLoading || isLoadingOrders}
            />
          </TabsContent>

          {/* Products */}
          <TabsContent value="products" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#e8f5ee" }}
                  >
                    <Package className="w-4 h-4" style={{ color: "#1a6b3c" }} />
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground">
                      Total Products
                    </p>
                    <p
                      className="font-heading font-bold text-xl leading-none"
                      style={{ color: "#1a6b3c" }}
                    >
                      {isLoading ? "—" : totalProducts}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-red-50">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground">
                      Out of Stock
                    </p>
                    <p className="font-heading font-bold text-xl leading-none text-red-600">
                      {isLoading ? "—" : outOfStockCount}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-amber-50">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground">
                      Featured
                    </p>
                    <p className="font-heading font-bold text-xl leading-none text-amber-600">
                      {isLoading
                        ? "—"
                        : allProducts.filter((p) => p.featured).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Product Form */}
            <AddProductForm onAdded={refreshAdminData} />

            <Separator />

            {/* Product List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg text-foreground">
                  All Products
                </h2>
                <span className="font-body text-xs text-muted-foreground">
                  Click stock badge to toggle
                </span>
              </div>

              <Card className="border border-border shadow-sm overflow-hidden">
                {isLoading ? (
                  <div
                    data-ocid="admin.product.loading_state"
                    className="flex items-center justify-center py-16 gap-3"
                  >
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <span className="font-body text-sm text-muted-foreground">
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
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments">
            <PaymentsTab isInitialized={isInitialized} />
          </TabsContent>

          {/* Orders & Revenue */}
          <TabsContent value="orders">
            <OrdersRevenueTab
              orders={confirmedOrders}
              products={allProducts}
              isLoading={isLoadingOrders || isLoading}
            />
          </TabsContent>

          {/* Sell */}
          <TabsContent value="sell">
            <SellTab
              products={allProducts}
              orders={confirmedOrders}
              isLoadingProducts={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
