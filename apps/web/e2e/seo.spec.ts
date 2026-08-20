import { test, expect } from "@playwright/test";

test.describe("SEO artifacts", () => {
  test("page has OG/Twitter meta tags and Person JSON-LD", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /Zohreh Sadeghi/,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      "https://www.zohrehsadeghi.se",
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toBeTruthy();
    const data = JSON.parse(jsonLd ?? "[]");
    const person = data.find((entry: { "@type": string }) => entry["@type"] === "Person");
    expect(person).toMatchObject({
      name: "Zohreh Sadeghi",
      sameAs: expect.arrayContaining([
        "https://github.com/Zoritta",
        "https://www.linkedin.com/in/zohreh-sadeghi",
      ]),
    });
  });

  test("sitemap.xml and robots.txt resolve", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("https://www.zohrehsadeghi.se");

    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const robotsBody = await robots.text();
    expect(robotsBody).toContain("Sitemap: https://www.zohrehsadeghi.se/sitemap.xml");
  });
});
