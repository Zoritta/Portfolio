import { test, expect } from "@playwright/test";
import type { FitReport } from "../src/lib/api";

const VALID_JOB_DESCRIPTION =
  "We are looking for a fullstack developer with React, TypeScript, and Node.js experience " +
  "to help build and maintain a modern web platform. Cloud infrastructure experience is a plus.";

const MOCK_REPORT: FitReport = {
  matchScore: 82,
  summary: "Mocked summary for e2e testing.",
  strengths: [{ point: "Strong React and TypeScript background.", citedSourceIndexes: [0] }],
  gaps: [{ point: "Limited exposure to the specific cloud provider mentioned." }],
  suggestedInterviewQuestions: ["Tell me about a recent React project."],
};

test.describe("Job Fit Analyzer", () => {
  test("submit button stays disabled below the minimum length", async ({ page }) => {
    await page.goto("/");
    const textarea = page.getByPlaceholder("Paste a job description here…");
    const submit = page.getByRole("button", { name: "Analyze Fit" });

    await textarea.fill("too short");
    await expect(submit).toBeDisabled();
  });

  test("submitting shows loading then renders the returned report", async ({ page }) => {
    await page.route("**/fit-analysis", async (route) => {
      // Small artificial delay so the loading state is actually observable — the mock would
      // otherwise resolve synchronously, and the assertion below would race the state flip.
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.fulfill({ status: 201, json: MOCK_REPORT });
    });

    await page.goto("/");
    const textarea = page.getByPlaceholder("Paste a job description here…");
    const submit = page.getByRole("button", { name: "Analyze Fit" });

    await textarea.fill(VALID_JOB_DESCRIPTION);
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByRole("button", { name: "Analyzing…" })).toBeVisible();

    await expect(page.getByText(`${MOCK_REPORT.matchScore}%`)).toBeVisible();
    await expect(page.getByText(MOCK_REPORT.summary)).toBeVisible();
    await expect(page.getByText(MOCK_REPORT.strengths[0].point)).toBeVisible();
    await expect(page.getByText(MOCK_REPORT.gaps[0].point)).toBeVisible();
    await expect(page.getByText(MOCK_REPORT.suggestedInterviewQuestions[0])).toBeVisible();
  });

  test("maps a 503 response to the service-unavailable message", async ({ page }) => {
    await page.route("**/fit-analysis", async (route) => {
      await route.fulfill({ status: 503, json: {} });
    });

    await page.goto("/");
    const textarea = page.getByPlaceholder("Paste a job description here…");
    await textarea.fill(VALID_JOB_DESCRIPTION);
    await page.getByRole("button", { name: "Analyze Fit" }).click();

    await expect(
      page.getByText("The AI service is temporarily unavailable. Please try again in a moment."),
    ).toBeVisible();
  });
});
