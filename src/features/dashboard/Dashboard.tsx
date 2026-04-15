import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { productsApi } from "@/api/products";
import { ordersApi } from "@/api/orders";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { StatusBadge } from "@/shared/components/StatusBadge";

export function Dashboard() {
  const productHealth = useQuery({
    queryKey: ["health", "products"],
    queryFn: productsApi.health,
    retry: false,
  });
  const orderHealth = useQuery({
    queryKey: ["health", "orders"],
    queryFn: ordersApi.health,
    retry: false,
  });
  const { data: products } = useProducts();
  const { data: orders } = useOrders();

  const services = [
    {
      name: "Product Service",
      url: "https://product-service-ua20.onrender.com",
      status: productHealth.data?.status,
      loading: productHealth.isLoading,
      error: productHealth.isError,
    },
    {
      name: "Order Service",
      url: "https://order-service-7342.onrender.com",
      status: orderHealth.data?.status,
      loading: orderHealth.isLoading,
      error: orderHealth.isError,
    },
  ];

  const stats = [
    {
      label: "Total Products",
      value: products?.length ?? "—",
      link: "/products",
    },
    {
      label: "Total Orders",
      value: orders?.length ?? "—",
      link: "/orders",
    },
    {
      label: "In Stock",
      value: products?.filter((p) => p.inStock).length ?? "—",
      link: "/products",
    },
    {
      label: "Confirmed Orders",
      value: orders?.filter((o) => o.status === "CONFIRMED").length ?? "—",
      link: "/orders",
    },
  ];

  const recentOrders = orders?.slice(-5).reverse() ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {/* Service Health */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">
          Service Health
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div>
                <p className="font-medium">{svc.name}</p>
                <p className="text-xs text-gray-400">{svc.url}</p>
              </div>
              {svc.loading ? (
                <span className="text-xs text-gray-400">Checking…</span>
              ) : svc.error ? (
                <StatusBadge value="DOWN" />
              ) : (
                <StatusBadge value={svc.status ?? "DOWN"} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="rounded-lg border border-gray-200 bg-white p-5 transition hover:shadow-md"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold">{stat.value}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Orders */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">
            Recent Orders
          </h2>
          <Link
            to="/orders"
            className="text-sm text-indigo-600 hover:underline"
          >
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3">{order.productName}</td>
                    <td className="px-4 py-3">{order.quantity}</td>
                    <td className="px-4 py-3">
                      ${Number(order.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
