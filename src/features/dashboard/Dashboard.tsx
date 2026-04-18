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
      url: import.meta.env.VITE_PRODUCT_SERVICE_URL,
      status: productHealth.data?.status,
      loading: productHealth.isLoading,
      error: productHealth.isError,
    },
    {
      name: "Order Service",
      url: import.meta.env.VITE_ORDER_SERVICE_URL,
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
      <span className="inline-block rounded-full bg-bosch-gold/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-bosch-gold">
        Console
      </span>
      <h1 className="mt-3 mb-8 text-4xl font-extrabold tracking-tight text-white">
        Dashboard
      </h1>

      {/* Service Health */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Service Health
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between rounded-xl border border-bosch-border bg-bosch-surface p-5 transition hover:border-bosch-gold"
            >
              <div>
                <p className="font-semibold text-white">{svc.name}</p>
                <p className="text-xs text-bosch-muted">{svc.url}</p>
              </div>
              {svc.loading ? (
                <span className="text-xs text-bosch-muted">Checking…</span>
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
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-white">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="group rounded-xl border border-bosch-border bg-bosch-surface p-6 transition hover:-translate-y-1 hover:border-bosch-gold hover:shadow-[0_10px_30px_rgba(184,150,28,0.15)]"
            >
              <p className="text-sm text-bosch-muted">{stat.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-white transition-colors group-hover:text-bosch-gold">
                {stat.value}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Orders */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-sm font-semibold text-bosch-gold hover:text-bosch-gold-light"
          >
            View all <span aria-hidden="true">→</span>
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-bosch-muted">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-bosch-border">
            <table className="min-w-full divide-y divide-bosch-border bg-bosch-surface text-sm">
              <thead className="bg-bosch-ink-2">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-bosch-gold text-xs">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-bosch-gold text-xs">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-bosch-gold text-xs">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-bosch-gold text-xs">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bosch-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-bosch-ink-2">
                    <td className="px-4 py-3 text-white">{order.productName}</td>
                    <td className="px-4 py-3">{order.quantity}</td>
                    <td className="px-4 py-3 font-semibold text-white">
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
