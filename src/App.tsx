import { Routes, Route } from "react-router";
import { Layout } from "@/shared/components/Layout";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { ProductList } from "@/features/products/components/ProductList";
import { ProductDetail } from "@/features/products/components/ProductDetail";
import { OrderList } from "@/features/orders/components/OrderList";
import { CreateOrder } from "@/features/orders/components/CreateOrder";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/new" element={<CreateOrder />} />
      </Routes>
    </Layout>
  );
}
