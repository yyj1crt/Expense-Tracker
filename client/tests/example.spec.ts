import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Expense Tracker/);
  await expect(page.locator("text=Dashboard")).toBeVisible();
});
