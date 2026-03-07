import type { Category, Product } from "../backend";

const STOCK_OVERRIDES_KEY = "admin_stock_overrides";
const ADMIN_PRODUCTS_KEY = "admin_products";

export function getStockOverrides(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STOCK_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function setStockOverride(productId: string, inStock: boolean): void {
  const overrides = getStockOverrides();
  overrides[productId] = inStock;
  localStorage.setItem(STOCK_OVERRIDES_KEY, JSON.stringify(overrides));
}

export function getAdminProducts(): Product[] {
  try {
    const raw = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw) as Array<
      Omit<Product, "id"> & { id: number }
    >;
    // Re-hydrate bigint IDs
    return items.map((p) => ({
      ...p,
      id: BigInt(p.id),
      category: p.category as Category,
    }));
  } catch {
    return [];
  }
}

export function addAdminProduct(product: Omit<Product, "id">): void {
  const existing = getAdminProducts();
  // Find next available ID starting from 1000
  const maxId = existing.reduce((max, p) => Math.max(max, Number(p.id)), 999);
  const newProduct: Product = {
    ...product,
    id: BigInt(maxId + 1),
  };
  // Serialize with number IDs (JSON can't handle bigint)
  const toStore = [...existing, newProduct].map((p) => ({
    ...p,
    id: Number(p.id),
  }));
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(toStore));
}

export function deleteAdminProduct(id: number): void {
  const existing = getAdminProducts();
  const filtered = existing.filter((p) => Number(p.id) !== id);
  const toStore = filtered.map((p) => ({ ...p, id: Number(p.id) }));
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(toStore));
}

/** Apply stock overrides to a list of products */
export function applyStockOverrides(products: Product[]): Product[] {
  const overrides = getStockOverrides();
  return products.map((p) => {
    const key = String(p.id);
    if (key in overrides) {
      return { ...p, stockAvailable: overrides[key] };
    }
    return p;
  });
}
