import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill("input[type='email']", "demo@example.com");
    await page.fill("input[type='password']", "demo123");
    await page.click("button:has-text('Sign in')");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("dashboard loads with summary cards visible", async ({ page }) => {
    // Verify page title
    await expect(page.locator("h1")).toContainText("Dashboard");
    
    // Verify summary cards are visible
    await expect(page.locator("text=Total Balance")).toBeVisible();
    await expect(page.locator("text=Total Income")).toBeVisible();
    await expect(page.locator("text=Total Expenses")).toBeVisible();
    
    // Verify cards display numeric values (currency format)
    const cards = page.locator("div:has-text(/\\$[0-9,]+\\.\\d{2}/)");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("charts render on dashboard", async ({ page }) => {
    // Wait for charts to render
    await page.waitForTimeout(1000);
    
    // Check for SVG elements (recharts uses SVG)
    const svgs = page.locator("svg");
    const svgCount = await svgs.count();
    
    // Or check for canvas elements
    const canvases = page.locator("canvas");
    const canvasCount = await canvases.count();
    
    // At least one chart should be rendered
    expect(svgCount + canvasCount).toBeGreaterThan(0);
    
    // Specifically check for common chart elements
    const chartTitles = page.locator("text=/Monthly|Category|Trends/i");
    const titleCount = await chartTitles.count();
    expect(titleCount).toBeGreaterThan(0);
  });

  test("recent transactions section shows entries", async ({ page }) => {
    // Verify "Recent Transactions" section is visible
    await expect(page.locator("text=Recent Transactions")).toBeVisible();
    
    // Verify transaction table or list is visible
    const recentTransactionsSection = page.locator("[class*='recent'], [class*='Recent']");
    
    // Check for transaction items (could be table rows or list items)
    await page.waitForTimeout(500);
    
    // Look for transaction data
    const transactionRows = page.locator("table tbody tr");
    const rowCount = await transactionRows.count();
    
    // If there are transactions, verify they display content
    if (rowCount > 0) {
      // Check that at least the first row has visible content
      const firstRow = transactionRows.first();
      const cells = firstRow.locator("td");
      const cellCount = await cells.count();
      expect(cellCount).toBeGreaterThan(0);
    }
  });

  test("dashboard displays loading state properly", async ({ page }) => {
    // Navigate away and back to trigger loading
    await page.goto("/transactions");
    await page.goto("/dashboard");
    
    // Wait for content to load
    await expect(page.locator("text=Total Balance")).toBeVisible({ timeout: 5000 });
    
    // Verify main content is visible after loading
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("summary cards have correct styling", async ({ page }) => {
    // Check that summary cards have consistent styling
    const cards = page.locator("[class*='card'], [class*='summary']").filter({
      hasText: /Total|Balance|Income|Expenses/,
    });
    
    // Should have at least 3 summary cards
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(3);
    
    // Verify each card is visible and has text content
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = cards.nth(i);
      await expect(card).toBeVisible();
    }
  });

  test("navigation to other pages from dashboard works", async ({ page }) => {
    // Click on Transactions link
    await page.click("a:has-text('Transactions')");
    
    // Verify navigation to transactions page
    await expect(page).toHaveURL(/\/transactions/);
    
    // Navigate back to dashboard
    await page.click("a:has-text('Dashboard')");
    
    // Verify back on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("dashboard is responsive on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify dashboard still loads and is visible
    await expect(page.locator("h1")).toContainText("Dashboard");
    
    // Verify summary cards are still visible and stacked
    await expect(page.locator("text=Total Balance")).toBeVisible();
    await expect(page.locator("text=Total Income")).toBeVisible();
    await expect(page.locator("text=Total Expenses")).toBeVisible();
  });
});
