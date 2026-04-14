import { useState } from "react";
import type { CreateProductRequest, Product } from "@/types";

interface Props {
  initialData?: Product;
  onSubmit: (data: CreateProductRequest) => void;
  isSubmitting: boolean;
}

export function ProductForm({ initialData, onSubmit, isSubmitting }: Props) {
  const [form, setForm] = useState<CreateProductRequest>({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? 0,
    category: initialData?.category ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const update = (field: keyof CreateProductRequest, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="product-name"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="product-category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <input
          id="product-category"
          required
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="product-description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">
          Price
        </label>
        <input
          id="product-price"
          required
          type="number"
          min="0.01"
          step="0.01"
          value={form.price || ""}
          onChange={(e) => update("price", parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
