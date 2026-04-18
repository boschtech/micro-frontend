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

  if (isLoading) return <p className="text-bosch-muted">Loading products…</p>;
  if (error) return <p className="text-red-400">Failed to load products.</p>;

  const handleCreate = (data: CreateProductRequest) => {
    createProduct.mutate(data, { onSuccess: () => setShowForm(false) });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="inline-block rounded-full bg-bosch-gold/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-bosch-gold">
            Catalog
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
            Products
          </h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-bosch-gold px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-bosch-gold-dark"
        >
          {showForm ? "Cancel" : "New Product"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-xl border border-bosch-border bg-bosch-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Create Product
          </h2>
          <ProductForm
            onSubmit={handleCreate}
            isSubmitting={createProduct.isPending}
          />
        </div>
      )}

      {products?.length === 0 ? (
        <p className="text-bosch-muted">No products found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-xl border border-bosch-border bg-bosch-surface p-6 transition hover:-translate-y-1 hover:border-bosch-gold hover:shadow-[0_10px_30px_rgba(184,150,28,0.15)]"
            >
              <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-bosch-gold transition-transform group-hover:scale-x-100" />
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    to={`/products/${product.id}`}
                    className="text-lg font-semibold text-white hover:text-bosch-gold"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-sm text-bosch-muted">
                    {product.category}
                  </p>
                </div>
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

              <p className="mt-3 line-clamp-2 text-sm text-bosch-text">
                {product.description}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-bosch-border pt-4">
                <span className="text-xl font-extrabold text-bosch-gold">
                  ${Number(product.price).toFixed(2)}
                </span>
                <button
                  onClick={() => deleteProduct.mutate(product.id)}
                  className="text-sm font-semibold text-red-400 hover:text-red-300"
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
