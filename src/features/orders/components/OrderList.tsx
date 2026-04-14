import { Link } from "react-router";
import { useOrders } from "../hooks/useOrders";
import { StatusBadge } from "@/shared/components/StatusBadge";

export function OrderList() {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) return <p className="text-gray-500">Loading orders…</p>;
  if (error) return <p className="text-red-600">Failed to load orders.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Link
          to="/orders/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New Order
        </Link>
      </div>

      {orders?.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Order ID
                </th>
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
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                    {order.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/products/${order.productId}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {order.productName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.quantity}</td>
                  <td className="px-4 py-3 font-medium">
                    ${Number(order.totalPrice).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={order.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
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
