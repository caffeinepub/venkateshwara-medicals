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
    staleTime: 0,
    gcTime: 0,
    retry: 5,
    retryDelay: 1000,
  });
}

export function useGetAllProducts(isInitialized = true) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching && isInitialized,
    staleTime: 0,
  });
}

export function useGetFeaturedProducts(isInitialized = true) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProducts();
    },
    enabled: !!actor && !isFetching && isInitialized,
    staleTime: 0,
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
