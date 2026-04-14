import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useCreateOrder } from "../hooks/useOrders";
import { useProducts } from "@/features/products/hooks/useProducts";

export function CreateOrder() {
  const navigate = useNavigate();
  const { data: products, isLoading: productsLoading } = useProducts();
  const createOrder = useCreateOrder();

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder.mutate(
      { productId, quantity },
      { onSuccess: () => navigate("/orders") },
    );
  };

  const selectedProduct = products?.find((p) => p.id === productId);

  return (
    <div>
      <Link to="/orders" className="text-sm text-indigo-600 hover:underline">
        &larr; Back to Orders
      </Link>

      <div className="mt-4 max-w-lg rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="mb-6 text-2xl font-bold">Create Order</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="order-product" className="block text-sm font-medium text-gray-700">
              Product
            </label>
            <select
              id="order-product"
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={productsLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select a product…</option>
              {products
                ?.filter((p) => p.inStock)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${Number(p.price).toFixed(2)}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="order-quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              id="order-quantity"
              required
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {selectedProduct && (
            <div className="rounded-md bg-gray-50 p-4 text-sm">
              <p className="font-medium">{selectedProduct.name}</p>
              <p className="text-gray-500">{selectedProduct.description}</p>
              <p className="mt-2 font-semibold">
                Estimated total: $
                {(Number(selectedProduct.price) * quantity).toFixed(2)}
              </p>
            </div>
          )}

          {createOrder.error && (
            <p className="text-sm text-red-600">
              Failed to create order. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={createOrder.isPending || !productId}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {createOrder.isPending ? "Placing Order…" : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
