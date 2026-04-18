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

  const inputClass =
    "mt-1 block w-full rounded-md border-2 border-bosch-border bg-bosch-ink-2 px-3 py-2.5 text-sm text-white placeholder:text-bosch-muted focus:border-bosch-gold focus:outline-none focus:ring-0";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div>
        <label
          htmlFor="product-name"
          className="block text-sm font-semibold text-white"
        >
          Name
        </label>
        <input
          id="product-name"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="product-category"
          className="block text-sm font-semibold text-white"
        >
          Category
        </label>
        <input
          id="product-category"
          required
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="sm:col-span-2">
        <label
          htmlFor="product-description"
          className="block text-sm font-semibold text-white"
        >
          Description
        </label>
        <textarea
          id="product-description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="product-price"
          className="block text-sm font-semibold text-white"
        >
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
          className={inputClass}
        />
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-bosch-gold px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-bosch-gold-dark disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
