import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductForm } from "../ProductForm";

describe("ProductForm", () => {
  it("renders empty fields for create mode", () => {
    render(<ProductForm onSubmit={vi.fn()} isSubmitting={false} />);

    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Category")).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");
    expect(screen.getByLabelText("Price")).toHaveValue(null);
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
    expect(screen.getByText("Update")).toBeInTheDocument();
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
    });
  });

  it("shows Saving… when isSubmitting is true", () => {
    render(<ProductForm onSubmit={vi.fn()} isSubmitting={true} />);
    expect(screen.getByText("Saving…")).toBeInTheDocument();
    expect(screen.getByText("Saving…")).toBeDisabled();
  });
});
