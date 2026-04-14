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

  if (isLoading) return <p className="text-gray-500">Loading…</p>;
  if (error || !product)
    return <p className="text-red-600">Product not found.</p>;

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
        className="text-sm text-indigo-600 hover:underline"
      >
        &larr; Back to Products
      </Link>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{product.category}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing((v) => !v)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleDelete}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        <p className="mt-4 text-gray-600">{product.description}</p>

        <div className="mt-4 flex items-center gap-4">
          <span className="text-2xl font-bold">
            ${Number(product.price).toFixed(2)}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              product.inStock
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {editing && (
          <div className="mt-6 border-t pt-6">
            <h2 className="mb-4 text-lg font-semibold">Edit Product</h2>
            <ProductForm
              initialData={product}
              onSubmit={handleUpdate}
              isSubmitting={updateProduct.isPending}
            />
          </div>
        )}
      </div>

      {/* Associated orders */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">
          Orders{" "}
          {productOrders && (
            <span className="text-sm font-normal text-gray-500">
              ({productOrders.orderCount})
            </span>
          )}
        </h2>

        {!productOrders?.orders?.length ? (
          <p className="text-gray-500">No orders for this product.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Order ID
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
                {productOrders.orders.map((order) => (
                  <tr key={order.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                      {order.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3">{order.quantity}</td>
                    <td className="px-4 py-3">
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
    </div>
  );
}
