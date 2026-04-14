// ── Product Service types ─────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
}

export type UpdateProductRequest = CreateProductRequest;

// ── Order Service types ──────────────────────────────────────

export interface Order {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface CreateOrderRequest {
  productId: string;
  quantity: number;
}

// ── Composite types ──────────────────────────────────────────

export interface ProductOrders {
  productId: string;
  productName: string;
  orderCount: number;
  orders: Order[];
}

export interface HealthStatus {
  status: "UP" | "DOWN";
}
