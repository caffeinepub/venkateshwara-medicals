import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Loader2,
  LogOut,
  Package,
  PackageX,
  ShoppingBag,
  TrendingUp,
  Truck,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Order, Product } from "../backend";
import {
  useGetAllOrders,
  useGetAllProducts,
  useInitialize,
  usePlaceOrder,
} from "../hooks/useQueries";
import {
  applyStockOverrides,
  getStockOverrides,
  setStockOverride,
} from "../lib/adminOverrides";
import { getCategoryLabel, getProductImageUrl } from "../lib/productUtils";

const SUPPLIER_PIN = "supplier123";

// ── PIN Gate ──────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === SUPPLIER_PIN) {
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
            <Truck className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="font-heading text-xl text-foreground">
            Supplier Access
          </CardTitle>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Enter your supplier PIN to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="supplier-pin-input" className="font-body text-sm">
                PIN
              </Label>
              <Input
                id="supplier-pin-input"
                data-ocid="supplier.pin_input"
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Enter supplier PIN"
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
              data-ocid="supplier.pin_submit_button"
              className="w-full font-body font-semibold gap-2"
              style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
            >
              <Truck className="w-4 h-4" />
              Unlock Supplier Portal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab({
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
      <div data-ocid="supplier.order.loading_state" className="space-y-4 p-2">
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
        {orders.length === 0 ? (
          <div
            data-ocid="supplier.order.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center gap-3"
          >
            <ClipboardList className="w-10 h-10 text-muted-foreground" />
            <p className="font-body text-muted-foreground">No orders yet</p>
            <p className="font-body text-xs text-muted-foreground">
              Customer orders will appear here once placed
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="supplier.order.table">
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
                      data-ocid={`supplier.order.row.${rowIndex}`}
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

// ── Products / Stock Tab ───────────────────────────────────────────────────────
function ProductsTab({
  products,
  isLoading,
}: {
  products: Product[];
  isLoading: boolean;
}) {
  const [stockOverrides, setStockOverridesState] = useState<
    Record<string, boolean>
  >(() => getStockOverrides());

  useEffect(() => {
    const handleFocus = () => setStockOverridesState(getStockOverrides());
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const productsWithOverrides = useMemo(() => {
    // Apply current stockOverrides from state to get reactive updates
    return products.map((p) => {
      const key = String(p.id);
      if (key in stockOverrides) {
        return { ...p, stockAvailable: stockOverrides[key] };
      }
      return p;
    });
  }, [products, stockOverrides]);

  const inStockCount = productsWithOverrides.filter(
    (p) => p.stockAvailable,
  ).length;
  const outOfStockCount = productsWithOverrides.filter(
    (p) => !p.stockAvailable,
  ).length;

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

  if (isLoading) {
    return (
      <div className="space-y-4 p-2">
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
                {products.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground">
                In Stock
              </p>
              <p className="font-heading font-bold text-xl leading-none text-green-600">
                {inStockCount}
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
                {outOfStockCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="border border-border shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div
            data-ocid="supplier.product.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center gap-3"
          >
            <Package className="w-10 h-10 text-muted-foreground" />
            <p className="font-body text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="supplier.product.table">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body text-xs w-14">
                    Image
                  </TableHead>
                  <TableHead className="font-body text-xs">Name</TableHead>
                  <TableHead className="font-body text-xs hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="font-body text-xs hidden sm:table-cell">
                    Price
                  </TableHead>
                  <TableHead className="font-body text-xs">
                    Stock Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsWithOverrides.map((product, idx) => {
                  const rowIndex = idx + 1;
                  const idStr = String(product.id);

                  return (
                    <TableRow
                      key={idStr}
                      data-ocid={`supplier.product.row.${rowIndex}`}
                      className="hover:bg-muted/40"
                    >
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
                      <TableCell>
                        <span className="font-body text-sm font-medium truncate max-w-[140px] md:max-w-[220px] block">
                          {product.name}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-body text-xs text-muted-foreground">
                          {getCategoryLabel(product.category)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span
                          className="font-body text-sm font-semibold"
                          style={{ color: "#1a6b3c" }}
                        >
                          ₹{product.price.toFixed(0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          data-ocid={`supplier.stock_toggle.${rowIndex}`}
                          onClick={() =>
                            handleToggleStock(idStr, product.stockAvailable)
                          }
                          className={`font-body text-xs gap-1.5 h-7 px-2 transition-colors ${
                            product.stockAvailable
                              ? "border-green-500 text-green-700 hover:bg-green-50"
                              : "border-red-400 text-red-600 hover:bg-red-50"
                          }`}
                        >
                          {product.stockAvailable ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">In Stock</span>
                            </>
                          ) : (
                            <>
                              <PackageX className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">
                                Out of Stock
                              </span>
                            </>
                          )}
                        </Button>
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
                    data-ocid="supplier.sell.product_select"
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
                  data-ocid="supplier.sell.quantity_input"
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
                Supplier Note{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="sell-note"
                data-ocid="supplier.sell.note_textarea"
                value={supplierNote}
                onChange={(e) => setSupplierNote(e.target.value)}
                placeholder="Add any notes about this sale..."
                className="font-body resize-none"
                rows={2}
              />
            </div>

            <Button
              type="submit"
              data-ocid="supplier.sell.submit_button"
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
              data-ocid="supplier.sales.empty_state"
              className="flex flex-col items-center justify-center py-10 text-center gap-2"
            >
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              <p className="font-body text-sm text-muted-foreground">
                No supplier sales recorded yet
              </p>
            </div>
          </Card>
        ) : (
          <div data-ocid="supplier.sales.list" className="space-y-2">
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
                  data-ocid={`supplier.sales.item.${itemIdx}`}
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
                          Supplier Sale
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

// ── Main Supplier Page ─────────────────────────────────────────────────────────
export default function SupplierPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const { data: initData } = useInitialize();
  const isInitialized = !!initData;

  const { data: products = [], isLoading: isLoadingProducts } =
    useGetAllProducts(isInitialized);
  const { data: orders = [], isLoading: isLoadingOrders } =
    useGetAllOrders(isInitialized);

  if (!isUnlocked) {
    return <PinGate onUnlock={() => setIsUnlocked(true)} />;
  }

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
              <Truck className="w-4 h-4" style={{ color: "#0f4526" }} />
            </div>
            <div>
              <span className="font-heading font-bold text-white text-sm leading-none">
                Supplier Portal
              </span>
              <p className="font-body text-[10px] text-green-300 leading-none mt-0.5">
                Venkateshwara Medicals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-body text-xs text-green-300 hidden sm:block">
              Logged in as Supplier
            </span>
            <Button
              size="sm"
              variant="ghost"
              data-ocid="supplier.logout_button"
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
        <Tabs defaultValue="orders">
          <TabsList className="mb-6 w-full sm:w-auto grid grid-cols-3 sm:inline-flex gap-1 h-auto p-1">
            <TabsTrigger
              value="orders"
              data-ocid="supplier.orders_tab"
              className="font-body text-xs sm:text-sm gap-1.5 px-3 py-2"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              data-ocid="supplier.products_tab"
              className="font-body text-xs sm:text-sm gap-1.5 px-3 py-2"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Stock</span>
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              data-ocid="supplier.sell_tab"
              className="font-body text-xs sm:text-sm gap-1.5 px-3 py-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Sell</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersTab
              orders={orders}
              products={products}
              isLoading={isLoadingOrders || isLoadingProducts}
            />
          </TabsContent>

          <TabsContent value="products">
            <ProductsTab products={products} isLoading={isLoadingProducts} />
          </TabsContent>

          <TabsContent value="sell">
            <SellTab
              products={products}
              orders={orders}
              isLoadingProducts={isLoadingProducts}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
