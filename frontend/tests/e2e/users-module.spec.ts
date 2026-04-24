import { expect, test } from "@playwright/test";

test("renders the users register and supports filtering", async ({ page }) => {
  const response = await page.request.post("/api/portal/session", {
    data: {
      provider: "GOOGLE",
      email: "admin@saudina.local",
      displayName: "SaudiNA Super Admin",
    },
  });

  expect(response.ok()).toBeTruthy();

  await page.goto("/portal/admin/users");

  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "User directory" })).toBeVisible();

  await page.getByPlaceholder("Search users...").fill("Saudi");
  await page.getByPlaceholder("Search users...").press("Enter");

  await expect(page.getByRole("table").getByText("SaudiNA Super Admin")).toBeVisible();
  await expect(page.getByRole("table").getByText("Ahmed Gohar")).toHaveCount(0);
});

test("opens a user details page from the users register", async ({ page }) => {
  const response = await page.request.post("/api/portal/session", {
    data: {
      provider: "GOOGLE",
      email: "admin@saudina.local",
      displayName: "SaudiNA Super Admin",
    },
  });

  expect(response.ok()).toBeTruthy();

  await page.goto("/portal/admin/users");

  await page.getByRole("button", { name: /open details/i }).nth(1).click();

  await expect(page.getByRole("button", { name: "Back to users" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Assignments" })).toBeVisible();
});
