import { expect, test } from "@playwright/test";

test("renders Arabic homepage hero", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.getByText("مجتمعنا")).toBeVisible();
});

test("switches to English meetings page", async ({ page }) => {
  await page.goto("/en/meetings");
  await expect(page.getByText("Find your calm")).toBeVisible();
  await expect(page.getByText("Meeting filters")).toBeVisible();
});

test("renders the contact form", async ({ page }) => {
  await page.goto("/en/contact");
  await page.getByPlaceholder("Name").fill("Test User");
  await page.getByPlaceholder("Email").fill("test@example.com");
  await page.getByPlaceholder("Subject").fill("Support");
  await page.getByPlaceholder("Write your message here").fill("I need help finding a meeting.");
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
});

test("renders the chatbot launcher on public pages", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("button", { name: /open message assistant/i })).toBeVisible();
});
