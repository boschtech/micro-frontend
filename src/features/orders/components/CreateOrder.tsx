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

  const inputClass =
    "mt-1 block w-full rounded-md border-2 border-bosch-border bg-bosch-ink-2 px-3 py-2.5 text-sm text-white focus:border-bosch-gold focus:outline-none focus:ring-0";

  return (
    <div>
      <Link
        to="/orders"
        className="text-sm font-semibold text-bosch-gold hover:text-bosch-gold-light"
      >
        &larr; Back to Orders
      </Link>

      <div className="mt-4 max-w-lg rounded-xl border border-bosch-border bg-bosch-surface p-8">
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-white">
          Create Order
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="order-product"
              className="block text-sm font-semibold text-white"
            >
              Product
            </label>
            <select
              id="order-product"
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={productsLoading}
              className={inputClass}
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
            <label
              htmlFor="order-quantity"
              className="block text-sm font-semibold text-white"
            >
              Quantity
            </label>
            <input
              id="order-quantity"
              required
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              className={inputClass}
            />
          </div>

          {selectedProduct && (
            <div className="rounded-md border border-bosch-border bg-bosch-ink-2 p-4 text-sm">
              <p className="font-semibold text-white">{selectedProduct.name}</p>
              <p className="text-bosch-muted">{selectedProduct.description}</p>
              <p className="mt-2 text-base font-semibold text-bosch-gold">
                Estimated total: $
                {(Number(selectedProduct.price) * quantity).toFixed(2)}
              </p>
            </div>
          )}

          {createOrder.error && (
            <p className="text-sm text-red-400">
              Failed to create order. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={createOrder.isPending || !productId}
            className="w-full rounded-md bg-bosch-gold px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-bosch-gold-dark disabled:opacity-50"
          >
            {createOrder.isPending ? "Placing Order…" : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
