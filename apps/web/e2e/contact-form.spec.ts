import { test, expect } from "@playwright/test";

test.describe("Contact form", () => {
  test("submit stays disabled with an invalid email", async ({ page }) => {
    await page.goto("/#contact");
    await page.getByPlaceholder("Your name").fill("Ada Lovelace");
    await page.getByPlaceholder("Your email").fill("not-an-email");
    await page.getByPlaceholder("Your message…").fill("This is a long enough test message.");

    await expect(page.getByRole("button", { name: "Send Message" })).toBeDisabled();
  });

  test("valid submit shows inline success and clears the form", async ({ page }) => {
    await page.route("**/contact", async (route) => {
      // Small artificial delay so the loading state is actually observable — the mock would
      // otherwise resolve synchronously, and the assertion below would race the state flip.
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.fulfill({ status: 201, json: { success: true } });
    });

    await page.goto("/#contact");
    await page.getByPlaceholder("Your name").fill("Ada Lovelace");
    await page.getByPlaceholder("Your email").fill("ada@example.com");
    await page.getByPlaceholder("Your message…").fill("This is a long enough test message.");

    const submit = page.getByRole("button", { name: "Send Message" });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByRole("button", { name: "Sending…" })).toBeVisible();
    await expect(
      page.getByText("Thanks — your message has been sent. I'll get back to you soon."),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Your name")).toHaveValue("");
  });

  test("maps a 429 response to the rate-limit message", async ({ page }) => {
    await page.route("**/contact", async (route) => {
      await route.fulfill({ status: 429, json: {} });
    });

    await page.goto("/#contact");
    await page.getByPlaceholder("Your name").fill("Ada Lovelace");
    await page.getByPlaceholder("Your email").fill("ada@example.com");
    await page.getByPlaceholder("Your message…").fill("This is a long enough test message.");
    await page.getByRole("button", { name: "Send Message" }).click();

    await expect(
      page.getByText("Too many requests — please wait a minute and try again."),
    ).toBeVisible();
  });
});
