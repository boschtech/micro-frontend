import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import type { CreateOrderRequest } from "@/types";

const keys = {
  all: ["orders"] as const,
  detail: (id: string) => ["orders", id] as const,
  byProduct: (productId: string) =>
    ["orders", "product", productId] as const,
};

export function useOrders() {
  return useQuery({
    queryKey: keys.all,
    queryFn: ordersApi.getAll,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  });
}

export function useOrdersByProduct(productId: string) {
  return useQuery({
    queryKey: keys.byProduct(productId),
    queryFn: () => ordersApi.getByProductId(productId),
    enabled: !!productId,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
