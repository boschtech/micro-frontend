import { apiFetch, serviceUrl } from "./client";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductOrders,
  HealthStatus,
} from "@/types";

const base = () => `${serviceUrl.products}/api/products`;

export const productsApi = {
  getAll: () => apiFetch<Product[]>(base()),

  getById: (id: string) => apiFetch<Product>(`${base()}/${id}`),

  create: (data: CreateProductRequest) =>
    apiFetch<Product>(base(), {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateProductRequest) =>
    apiFetch<Product>(`${base()}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`${base()}/${id}`, { method: "DELETE" }),

  getOrders: (id: string) =>
    apiFetch<ProductOrders>(`${base()}/${id}/orders`),

  health: () =>
    apiFetch<HealthStatus>(
      `${serviceUrl.products}/actuator/health`,
    ),
};
