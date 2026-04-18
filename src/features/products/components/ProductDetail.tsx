import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  useProduct,
  useProductOrders,
  useUpdateProduct,
  useDeleteProduct,
} from "../hooks/useProducts";
import { ProductForm } from "./ProductForm";
import { StatusBadge } from "@/shared/components/StatusBadge";
import type { CreateProductRequest } from "@/types";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id!);
  const { data: productOrders } = useProductOrders(id!);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <p className="text-bosch-muted">Loading…</p>;
  if (error || !product)
    return <p className="text-red-400">Product not found.</p>;

  const handleUpdate = (data: CreateProductRequest) => {
    updateProduct.mutate(
      { id: id!, data },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleDelete = () => {
    deleteProduct.mutate(id!, { onSuccess: () => navigate("/products") });
  };

  return (
    <div>
      <Link
        to="/products"
        className="text-sm font-semibold text-bosch-gold hover:text-bosch-gold-light"
      >
        &larr; Back to Products
      </Link>

      <div className="mt-4 rounded-xl border border-bosch-border bg-bosch-surface p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-bosch-muted">{product.category}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing((v) => !v)}
              className="rounded-md border border-bosch-gold px-4 py-2 text-sm font-semibold text-bosch-gold transition-colors hover:bg-bosch-gold hover:text-black"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleDelete}
              className="rounded-md border border-red-500/60 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        </div>

        <p className="mt-5 text-bosch-text">{product.description}</p>

        <div className="mt-5 flex items-center gap-4">
          <span className="text-3xl font-extrabold text-bosch-gold">
            ${Number(product.price).toFixed(2)}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              product.inStock
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {editing && (
          <div className="mt-8 border-t border-bosch-border pt-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Edit Product</h2>
            <ProductForm
              initialData={product}
              onSubmit={handleUpdate}
              isSubmitting={updateProduct.isPending}
            />
          </div>
        )}
      </div>

      {/* Associated orders */}
      <div className="mt-10">
        <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-white">
          Orders{" "}
          {productOrders && (
            <span className="text-base font-normal text-bosch-muted">
              ({productOrders.orderCount})
            </span>
          )}
        </h2>

        {!productOrders?.orders?.length ? (
          <p className="text-bosch-muted">No orders for this product.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-bosch-border">
            <table className="min-w-full divide-y divide-bosch-border bg-bosch-surface text-sm">
              <thead className="bg-bosch-ink-2">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-bosch-gold">
                    Order ID
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
                {productOrders.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-bosch-ink-2">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-bosch-muted">
                      {order.id.slice(0, 8)}…
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
    </div>
  );
}
