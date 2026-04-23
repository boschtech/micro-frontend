import { expect } from "vitest";
import { axe } from "vitest-axe";
import type { AxeCore } from "vitest-axe";

/**
 * Default axe options used across every a11y test. `color-contrast` is
 * disabled because jsdom does not compute styles reliably.
 */
export const defaultAxeOptions: AxeCore.RunOptions = {
  rules: {
    "color-contrast": { enabled: false },
  },
};

/**
 * Runs axe on the provided DOM and asserts no violations. Failures render a
 * readable per-rule report including the failing HTML fragment and help URL.
 */
export async function expectNoA11yViolations(
  container: Element,
  options: AxeCore.RunOptions = defaultAxeOptions,
): Promise<void> {
  const results = await axe(container, options);
  const violations = results.violations;

  if (violations.length === 0) {
    expect(violations).toEqual([]);
    return;
  }

  const message = violations
    .map((v) => {
      const targets = v.nodes
        .map((n) => `    - ${n.target.join(", ")}\n      ${n.html}`)
        .join("\n");
      return `• [${v.impact ?? "unknown"}] ${v.id}: ${v.help}\n  ${v.helpUrl}\n${targets}`;
    })
    .join("\n\n");

  throw new Error(
    `Expected no accessibility violations but found ${violations.length}:\n\n${message}`,
  );
}
