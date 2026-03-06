import { create } from "zustand";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  setCartOpen: (open: boolean) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isCartOpen: false,

  addToCart: (item, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity }] };
    });
  },

  removeFromCart: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i,
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getCartTotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  setCartOpen: (open) => set({ isCartOpen: open }),
}));
