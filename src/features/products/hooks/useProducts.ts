import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { productsApi } from "@/api/products";
import type { CreateProductRequest, UpdateProductRequest } from "@/types";

const keys = {
  all: ["products"] as const,
  detail: (id: string) => ["products", id] as const,
  orders: (id: string) => ["products", id, "orders"] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: keys.all,
    queryFn: productsApi.getAll,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}

export function useProductOrders(id: string) {
  return useQuery({
    queryKey: keys.orders(id),
    queryFn: () => productsApi.getOrders(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productsApi.update(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
