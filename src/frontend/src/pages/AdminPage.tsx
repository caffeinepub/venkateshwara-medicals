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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  LogOut,
  Package,
  PackageX,
  Plus,
  ShieldAlert,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Category, type Product } from "../backend";
import { useGetAllProducts, useInitialize } from "../hooks/useQueries";
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
            Admin Access
          </CardTitle>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Enter your admin PIN to continue
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
                <p className="font-body text-xs text-destructive flex items-center gap-1">
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
              Unlock Admin Panel
            </Button>
          </form>
        </CardContent>
      </Card>
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

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [stockOverrides, setStockOverridesState] = useState<
    Record<string, boolean>
  >(() => getStockOverrides());
  const [adminProducts, setAdminProductsState] = useState<Product[]>(() =>
    getAdminProducts(),
  );

  useInitialize();
  const { data: backendProducts, isLoading } = useGetAllProducts();

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

  // Stats
  const totalProducts = allProducts.length;
  const outOfStockCount = allProducts.filter((p) => {
    const override = stockOverrides[String(p.id)];
    return override !== undefined ? !override : !p.stockAvailable;
  }).length;
  const featuredCount = allProducts.filter((p) => p.featured).length;

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
                Admin Panel
              </span>
              <p className="font-body text-[10px] text-green-300 leading-none mt-0.5">
                Venkateshwara Medicals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-body text-xs text-green-300 hidden sm:block">
              Logged in as Admin
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

      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
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
                  {isLoading ? "—" : featuredCount}
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
      </div>
    </div>
  );
}
