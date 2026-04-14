import { apiFetch, serviceUrl } from "./client";
import type { Order, CreateOrderRequest, HealthStatus } from "@/types";

const base = () => `${serviceUrl.orders}/api/orders`;

export const ordersApi = {
  getAll: () => apiFetch<Order[]>(base()),

  getById: (id: string) => apiFetch<Order>(`${base()}/${id}`),

  create: (data: CreateOrderRequest) =>
    apiFetch<Order>(base(), {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getByProductId: (productId: string) =>
    apiFetch<Order[]>(`${base()}/product/${productId}`),

  health: () =>
    apiFetch<HealthStatus>(
      `${serviceUrl.orders}/actuator/health`,
    ),
};
