import { test, expect } from "@playwright/test";

const ROLES = ["Fullstack Developer", "Cloud-Native Engineer", "AI/RAG Developer"];

test("hero role text rotates over time", async ({ page }) => {
  await page.goto("/");

  const roleText = page.getByText(/— Malmö, Sweden$/);
  await expect(roleText).toBeVisible();

  const initial = await roleText.textContent();
  const initialRole = ROLES.find((role) => initial?.includes(role));
  expect(initialRole).toBeDefined();

  // Rotation interval is 2.5s — poll past it rather than a fixed wait, so this isn't flaky
  // under CI scheduling jitter.
  await expect(async () => {
    const current = await roleText.textContent();
    expect(current).not.toContain(initialRole);
  }).toPass({ timeout: 4000 });
});
