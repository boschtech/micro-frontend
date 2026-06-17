import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductForm } from "../ProductForm";

describe("ProductForm", () => {
  it("renders empty fields for create mode", () => {
    render(<ProductForm onSubmit={vi.fn()} isSubmitting={false} />);

    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Category")).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");
    expect(screen.getByLabelText("Price")).toHaveValue(null);
    // Stock status defaults to In Stock for new products
    expect(screen.getByLabelText("Stock Status")).toHaveValue("in-stock");
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("renders pre-filled fields for edit mode", () => {
    const product = {
      id: "1",
      name: "Keyboard",
      description: "Mechanical",
      price: 79.99,
      category: "Electronics",
      inStock: true,
    };
    render(
      <ProductForm
        initialData={product}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByLabelText("Name")).toHaveValue("Keyboard");
    expect(screen.getByLabelText("Category")).toHaveValue("Electronics");
    expect(screen.getByLabelText("Description")).toHaveValue("Mechanical");
    expect(screen.getByLabelText("Price")).toHaveValue(79.99);
    expect(screen.getByLabelText("Stock Status")).toHaveValue("in-stock");
    expect(screen.getByText("Update")).toBeInTheDocument();
  });

  it("reflects an out-of-stock product in edit mode", () => {
    const product = {
      id: "2",
      name: "Gizmo",
      description: "Sold out",
      price: 19.99,
      category: "Gizmos",
      inStock: false,
    };
    render(
      <ProductForm
        initialData={product}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByLabelText("Stock Status")).toHaveValue("out-of-stock");
  });

  it("renders both stock status options", () => {
    render(<ProductForm onSubmit={vi.fn()} isSubmitting={false} />);

    const select = screen.getByLabelText("Stock Status");
    const options = within(select).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual([
      "In Stock",
      "Out of Stock",
    ]);
  });

  it("calls onSubmit with form data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText("Name"), "Monitor");
    await user.type(screen.getByLabelText("Category"), "Electronics");
    await user.type(screen.getByLabelText("Description"), "4K display");
    await user.type(screen.getByLabelText("Price"), "399.99");
    await user.click(screen.getByText("Create"));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Monitor",
      category: "Electronics",
      description: "4K display",
      price: 399.99,
      inStock: true,
    });
  });

  it("submits inStock: false when Out of Stock is selected", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText("Name"), "Monitor");
    await user.type(screen.getByLabelText("Category"), "Electronics");
    await user.type(screen.getByLabelText("Description"), "4K display");
    await user.type(screen.getByLabelText("Price"), "399.99");
    await user.selectOptions(
      screen.getByLabelText("Stock Status"),
      "out-of-stock",
    );
    await user.click(screen.getByText("Create"));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Monitor",
      category: "Electronics",
      description: "4K display",
      price: 399.99,
      inStock: false,
    });
  });

  it("shows Saving… when isSubmitting is true", () => {
    render(<ProductForm onSubmit={vi.fn()} isSubmitting={true} />);
    expect(screen.getByText("Saving…")).toBeInTheDocument();
    expect(screen.getByText("Saving…")).toBeDisabled();
  });
});
