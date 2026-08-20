import { test, expect } from "@playwright/test";

test.describe("Nav", () => {
  test("anchor links scroll to their section", async ({ page }) => {
    await page.goto("/");

    for (const { label, sectionId } of [
      { label: "Projects", sectionId: "projects" },
      { label: "Experience", sectionId: "experience" },
      { label: "Skills", sectionId: "skills" },
      { label: "Contact", sectionId: "contact" },
    ]) {
      await page.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`#${sectionId}$`));
      await expect(page.locator(`#${sectionId}`)).toBeInViewport();
    }
  });
});

test.describe("Theme toggle", () => {
  test("switches theme and persists across reload", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const toggle = page.getByRole("button", { name: /switch to (dark|light) mode/i });

    const initiallyDark = (await html.getAttribute("class"))?.includes("dark") ?? false;

    await toggle.click();
    await expect(html).toHaveClass(initiallyDark ? /^(?!.*dark).*$/ : /dark/);

    await page.reload();
    await expect(html).toHaveClass(initiallyDark ? /^(?!.*dark).*$/ : /dark/);
  });
});
