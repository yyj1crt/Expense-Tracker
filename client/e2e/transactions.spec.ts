import { test, expect } from "@playwright/test";

test.describe("Transactions Management", () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type='email']", "demo@example.com");
    await page.fill("input[type='password']", "demo123");
    await page.click("button:has-text('Sign in')");
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Navigate to transactions page
    await page.click("a:has-text('Transactions')");
    await expect(page).toHaveURL(/\/transactions/);
  });

  test("add a new transaction: open modal → fill all fields → submit → verify in table", async ({
    page,
  }) => {
    // Click "Add Transaction" button
    await page.click("button:has-text('Add Transaction')");
    
    // Wait for modal to appear
    await expect(page.locator("[role='dialog']")).toBeVisible();
    
    // Fill transaction form
    await page.fill("input#title", "Test Expense");
    await page.fill("input#amount", "50.00");
    await page.click("button:has-text('Expense')"); // Select Expense type
    
    // Select category (first available)
    await page.selectOption("select#categoryId", { index: 1 });
    
    // Set date to today
    const today = new Date().toISOString().split("T")[0];
    await page.fill("input#date", today);
    
    // Add note
    await page.fill("textarea#note", "Test transaction note");
    
    // Submit modal
    await page.click("button:has-text('Add transaction')");
    
    // Wait for modal to close
    await expect(page.locator("[role='dialog']")).not.toBeVisible({ timeout: 3000 });
    
    // Wait for success toast
    await expect(page.locator("text=Transaction created successfully")).toBeVisible({
      timeout: 3000,
    });
    
    // Verify transaction appears in table
    await expect(page.locator("text=Test Expense")).toBeVisible();
  });

  test("edit a transaction: click edit → change title → save → verify updated", async ({
    page,
  }) => {
    // Add a test transaction first
    await page.click("button:has-text('Add Transaction')");
    await expect(page.locator("[role='dialog']")).toBeVisible();
    await page.fill("input#title", "Original Title");
    await page.fill("input#amount", "25.00");
    await page.click("button:has-text('Expense')");
    await page.selectOption("select#categoryId", { index: 1 });
    const today = new Date().toISOString().split("T")[0];
    await page.fill("input#date", today);
    await page.click("button:has-text('Add transaction')");
    await expect(page.locator("[role='dialog']")).not.toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=Transaction created successfully")).toBeVisible();
    
    // Wait a moment for table to refresh
    await page.waitForTimeout(500);
    
    // Click edit button on the transaction row
    const editButton = page.locator("button:has-text('Edit')").first();
    await editButton.click();
    
    // Wait for modal
    await expect(page.locator("[role='dialog']")).toBeVisible();
    
    // Clear and change title
    await page.fill("input#title", "Updated Title");
    
    // Submit
    await page.click("button:has-text('Save changes')");
    
    // Wait for modal to close
    await expect(page.locator("[role='dialog']")).not.toBeVisible({ timeout: 3000 });
    
    // Verify success toast
    await expect(page.locator("text=Transaction updated successfully")).toBeVisible({
      timeout: 3000,
    });
    
    // Verify updated title appears in table
    await expect(page.locator("text=Updated Title")).toBeVisible();
    await expect(page.locator("text=Original Title")).not.toBeVisible();
  });

  test("delete a transaction: click delete → confirm → verify removed", async ({
    page,
  }) => {
    // Add a test transaction first
    await page.click("button:has-text('Add Transaction')");
    await expect(page.locator("[role='dialog']")).toBeVisible();
    await page.fill("input#title", "To Delete");
    await page.fill("input#amount", "15.00");
    await page.click("button:has-text('Expense')");
    await page.selectOption("select#categoryId", { index: 1 });
    const today = new Date().toISOString().split("T")[0];
    await page.fill("input#date", today);
    await page.click("button:has-text('Add transaction')");
    await expect(page.locator("[role='dialog']")).not.toBeVisible({ timeout: 3000 });
    
    // Wait for table to refresh
    await page.waitForTimeout(500);
    
    // Click delete button
    const deleteButton = page.locator("button:has-text('Delete')").first();
    await deleteButton.click();
    
    // Wait for delete confirmation dialog
    await expect(page.locator("h2:has-text('Delete transaction')")).toBeVisible();
    
    // Click delete in confirmation dialog
    await page.click("button:has-text('Delete')");
    
    // Verify success toast
    await expect(page.locator("text=Transaction deleted successfully")).toBeVisible({
      timeout: 3000,
    });
    
    // Verify transaction is removed from table
    await expect(page.locator("text=To Delete")).not.toBeVisible({ timeout: 3000 });
  });

  test("filter by transaction type: click 'Expense' → verify only expenses shown", async ({
    page,
  }) => {
    // Click Expense filter button
    const expenseFilter = page.locator("button:has-text('Expense')").first();
    await expenseFilter.click();
    
    // Wait for table to update
    await page.waitForTimeout(500);
    
    // Get all visible transaction type badges
    const typeBadges = page.locator("span:has-text(/Income|Expense/)");
    const count = await typeBadges.count();
    
    if (count > 0) {
      // Verify all visible badges are "Expense"
      for (let i = 0; i < count; i++) {
        const badge = typeBadges.nth(i);
        await expect(badge).toContainText("Expense");
      }
    }
  });

  test("filter by category: select category → verify filtered results", async ({
    page,
  }) => {
    // Select first category from dropdown
    const categorySelect = page.locator("select#categoryFilter");
    await categorySelect.selectOption({ index: 1 });
    
    // Wait for table to update
    await page.waitForTimeout(500);
    
    // Verify table still has content or shows empty state
    const table = page.locator("table");
    const emptyState = page.locator("text=No transactions found");
    
    const hasTable = await table.isVisible().catch(() => false);
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    
    expect(hasTable || hasEmpty).toBeTruthy();
  });

  test("search transactions by title", async ({ page }) => {
    // Add a unique transaction
    await page.click("button:has-text('Add Transaction')");
    await expect(page.locator("[role='dialog']")).toBeVisible();
    const uniqueTitle = `SearchTest${Date.now()}`;
    await page.fill("input#title", uniqueTitle);
    await page.fill("input#amount", "20.00");
    await page.click("button:has-text('Expense')");
    await page.selectOption("select#categoryId", { index: 1 });
    const today = new Date().toISOString().split("T")[0];
    await page.fill("input#date", today);
    await page.click("button:has-text('Add transaction')");
    await expect(page.locator("[role='dialog']")).not.toBeVisible({ timeout: 3000 });
    
    // Wait a moment
    await page.waitForTimeout(500);
    
    // Search for the transaction
    await page.fill("input#searchFilter", uniqueTitle);
    
    // Wait for search to complete
    await page.waitForTimeout(600);
    
    // Verify the transaction appears
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible();
  });
});
