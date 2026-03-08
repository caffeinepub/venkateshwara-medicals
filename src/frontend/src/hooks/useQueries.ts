import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category, Order, PlaceOrderRequest, Product } from "../backend";
import { useActor } from "./useActor";

export function useInitialize() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["initialize"],
    queryFn: async () => {
      if (!actor) return null;
      await actor.initialize();
      return true;
    },
    enabled: !!actor && !isFetching,
    // Keep the initialized state alive for the entire session
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 8,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useGetAllProducts(isInitialized = true) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllProducts();
      // If backend returned empty after init, something went wrong -- retry
      if (result.length === 0) {
        // Re-seed by calling initialize again
        await actor.initialize();
        return actor.getAllProducts();
      }
      return result;
    },
    enabled: !!actor && !isFetching && isInitialized,
    staleTime: 0,
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}

export function useGetFeaturedProducts(isInitialized = true) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getFeaturedProducts();
      if (result.length === 0) {
        await actor.initialize();
        return actor.getFeaturedProducts();
      }
      return result;
    },
    enabled: !!actor && !isFetching && isInitialized,
    staleTime: 0,
    retry: 5,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}

export function useGetProductsByCategory(
  category: Category | null,
  isInitialized = true,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching && category !== null && isInitialized,
    staleTime: 0,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
  });
}

export function useSearchProducts(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", "search", searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchProducts(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: PlaceOrderRequest) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.placeOrder(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useGetAllOrders(isInitialized = true) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching && isInitialized,
    staleTime: 0,
  });
}

export function useGetOrder(orderId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["order", orderId?.toString()],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
  });
}

export function useGetPendingPaymentOrders(isInitialized = true) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", "pending-payment"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingPaymentOrders();
    },
    enabled: !!actor && !isFetching && isInitialized,
    staleTime: 0,
    refetchInterval: 10000,
  });
}

export function useGetConfirmedOrders(isInitialized = true) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", "confirmed"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConfirmedOrders();
    },
    enabled: !!actor && !isFetching && isInitialized,
    staleTime: 0,
  });
}

export function useSubmitPaymentProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      transactionId,
    }: {
      orderId: bigint;
      transactionId: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.submitPaymentProof(orderId, transactionId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["order", variables.orderId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.confirmPayment(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useRejectPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.rejectPayment(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
