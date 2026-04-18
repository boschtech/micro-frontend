import { Link } from "react-router";
import { useOrders } from "../hooks/useOrders";
import { StatusBadge } from "@/shared/components/StatusBadge";

export function OrderList() {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) return <p className="text-bosch-muted">Loading orders…</p>;
  if (error) return <p className="text-red-400">Failed to load orders.</p>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="inline-block rounded-full bg-bosch-gold/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-bosch-gold">
            Operations
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
            Orders
          </h1>
        </div>
        <Link
          to="/orders/new"
          className="rounded-md bg-bosch-gold px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-bosch-gold-dark"
        >
          New Order
        </Link>
      </div>

      {orders?.length === 0 ? (
        <p className="text-bosch-muted">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-bosch-border">
          <table className="min-w-full divide-y divide-bosch-border bg-bosch-surface text-sm">
            <thead className="bg-bosch-ink-2">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-bosch-gold">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-bosch-gold">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-bosch-gold">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-bosch-gold">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-bosch-gold">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-bosch-gold">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bosch-border">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-bosch-ink-2">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-bosch-muted">
                    {order.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/products/${order.productId}`}
                      className="font-medium text-white hover:text-bosch-gold"
                    >
                      {order.productName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.quantity}</td>
                  <td className="px-4 py-3 font-semibold text-white">
                    ${Number(order.totalPrice).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={order.status} />
                  </td>
                  <td className="px-4 py-3 text-bosch-muted">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
