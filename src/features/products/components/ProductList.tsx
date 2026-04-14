import { useState } from "react";
import { Link } from "react-router";
import {
  useProducts,
  useCreateProduct,
  useDeleteProduct,
} from "../hooks/useProducts";
import { ProductForm } from "./ProductForm";
import type { CreateProductRequest } from "@/types";

export function ProductList() {
  const { data: products, isLoading, error } = useProducts();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <p className="text-gray-500">Loading products…</p>;
  if (error) return <p className="text-red-600">Failed to load products.</p>;

  const handleCreate = (data: CreateProductRequest) => {
    createProduct.mutate(data, { onSuccess: () => setShowForm(false) });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "New Product"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Create Product</h2>
          <ProductForm
            onSubmit={handleCreate}
            isSubmitting={createProduct.isPending}
          />
        </div>
      )}

      {products?.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    to={`/products/${product.id}`}
                    className="text-lg font-semibold text-indigo-600 hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.category}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    product.inStock
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold">
                  ${Number(product.price).toFixed(2)}
                </span>
                <button
                  onClick={() => deleteProduct.mutate(product.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
