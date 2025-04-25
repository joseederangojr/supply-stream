import { test, expect } from "@playwright/test"

test.describe("Client UI", () => {
  test.beforeEach(async ({ page }) => {
    // Go to the client UI
    await page.goto("https://client.supplystream.com")
  })

  test("should allow login", async ({ page }) => {
    // Click the login button
    await page.click("text=Login")

    // Fill in the login form
    await page.fill('input[name="email"]', "client@example.com")
    await page.fill('input[name="password"]', "password123")
    await page.click('button[type="submit"]')

    // Expect to be redirected to the dashboard
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator("h1")).toContainText("Dashboard")
  })

  test("should create a new procurement request", async ({ page }) => {
    // Login first
    await page.click("text=Login")
    await page.fill('input[name="email"]', "client@example.com")
    await page.fill('input[name="password"]', "password123")
    await page.click('button[type="submit"]')

    // Navigate to the requests page
    await page.click("text=Requests")
    await page.click("text=New Request")

    // Fill in the request form
    await page.fill('input[name="title"]', "Test Request")
    await page.fill('textarea[name="description"]', "This is a test request")
    await page.selectOption('select[name="urgency"]', "MEDIUM")
    await page.fill('input[name="totalBudget"]', "1000")
    await page.click('button[type="submit"]')

    // Expect to be redirected to the request details page
    await expect(page).toHaveURL(/.*requests\/[a-f0-9-]+/)
    await expect(page.locator("h1")).toContainText("Test Request")
  })
})
