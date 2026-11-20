import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("login admin", async ({ page, request, context }) => {
  const addr: string = process.env.FRONTEND_ADDRESS || "localhost";
  const scheme = process.env.FRONTEND_SCHEME || "http";
  const passwordFile = process.env.ADMIN_PASSWORD_FILE;
  if (!passwordFile) {
    throw new Error("ADMIN_PASSWORD_FILE is required for the administrator login test");
  }
  const password = readFileSync(passwordFile, "utf8").replace(/\r?\n$/, "");

  const setup = await request.get(`${scheme}://${addr}:5173/api/admin_account_exists`);
  expect(await setup.text()).toBe("EXISTS");
  const defaultLogin = await request.post(`${scheme}://${addr}:5173/api/login`, {
    data: { username: "admin", password: "admin" },
  });
  expect(await defaultLogin.text()).toBe("NOK");

  // Go to dashboard login
  await page.goto(`${scheme}://${addr}:5173/login/`);

  await page.locator("#txt_username").fill("admin");
  await page.locator("#txt_pass").fill(password);

  // Click the login button
  await page.getByRole("button").click();

  // Expect the user to log in and the welcome text to show on the next page.
  await expect(page.getByText("Welcome, admin!")).toBeVisible();
  if (scheme === "https") {
    const cookie = (await context.cookies()).find((item) => item.name === "sessionId");
    expect(cookie?.secure).toBe(true);
  }
});
