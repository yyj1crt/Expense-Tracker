import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("full registration flow: fill form → submit → redirect to login", async ({
    page,
  }) => {
    await page.goto("/register");
    
    // Fill registration form
    await page.fill("input[type='email']", `user${Date.now()}@example.com`);
    await page.fill("input[type='password']", "TestPassword123!");
    await page.fill("input[placeholder*='Confirm']", "TestPassword123!");
    
    // Submit form
    await page.click("button:has-text('Create Account')");
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h1")).toContainText("Sign in");
  });

  test("login with valid credentials → redirect to dashboard", async ({
    page,
  }) => {
    await page.goto("/login");
    
    // Fill login form with demo credentials
    await page.fill("input[type='email']", "demo@example.com");
    await page.fill("input[type='password']", "demo123");
    
    // Submit form
    await page.click("button:has-text('Sign in')");
    
    // Wait for redirect and verify dashboard loads
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("login with wrong password → show error message", async ({ page }) => {
    await page.goto("/login");
    
    // Fill login form with wrong credentials
    await page.fill("input[type='email']", "demo@example.com");
    await page.fill("input[type='password']", "wrongpassword");
    
    // Submit form
    await page.click("button:has-text('Sign in')");
    
    // Wait for error message
    await expect(page.locator("text=Invalid credentials")).toBeVisible({
      timeout: 5000,
    });
  });

  test("unauthenticated user redirected to login when accessing dashboard", async ({
    page,
  }) => {
    // Try to access dashboard without authentication
    await page.goto("/dashboard");
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("logout clears auth and redirects to login", async ({ page }) => {
    await page.goto("/login");
    
    // Login first
    await page.fill("input[type='email']", "demo@example.com");
    await page.fill("input[type='password']", "demo123");
    await page.click("button:has-text('Sign in')");
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Find and click logout button (should be in sidebar or header)
    await page.click("button:has-text('Logout')");
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
