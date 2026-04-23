import { describe, it } from "vitest";
import { renderWithProviders } from "../test-utils";
import { Layout } from "@/shared/components/Layout";
import { Navbar } from "@/shared/components/Navbar";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { defaultAxeOptions, expectNoA11yViolations } from "./a11y-utils";

// Isolated components aren't wrapped by the outer `<main>` landmark, so
// also disable the `region` rule here (in addition to the global defaults).
const axeOptions = {
  ...defaultAxeOptions,
  rules: {
    ...defaultAxeOptions.rules,
    region: { enabled: false },
  },
};

describe("a11y: shared components", () => {
  it("Navbar has no accessibility violations", async () => {
    const { container } = renderWithProviders(<Navbar />);
    await expectNoA11yViolations(container, axeOptions);
  });

  it("Layout with children has no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <Layout>
        <h1>Page heading</h1>
        <p>Body content</p>
      </Layout>,
    );
    await expectNoA11yViolations(container, axeOptions);
  });

  it.each([
    "CONFIRMED",
    "PENDING",
    "CANCELLED",
    "UP",
    "DOWN",
    "UNKNOWN",
  ])("StatusBadge(%s) has no accessibility violations", async (value) => {
    const { container } = renderWithProviders(<StatusBadge value={value} />);
    await expectNoA11yViolations(container, axeOptions);
  });
});
