import { test, expect } from "@playwright/test";
import { UserModel } from "../../../../backend/db/user";
import mongoose, { ConnectOptions } from "mongoose";

test("login admin", async ({ page }) => {
  const addr: string = process.env.FRONTEND_ADDRESS || "localhost";

  // Go to dashboard login
  await page.goto("http://" + addr + ":5173/login/");

  // If the line below is uncommented, all tests succeed.
  // If not (currently), the first run (chromium) fails if the server has just started up.
  // This might be related to the way the login page was built (i.e., form submission)?
  //await page.waitForTimeout(3000);

  // Fill in default username and password
  await page.locator("#txt_username").fill("admin");
  await page.locator("#txt_pass").fill("admin");

  // Click the login button
  await page.getByRole("button").click();

  // Expect the user to log in and the welcome text to show on the next page.
  await expect(page.getByText("Welcome, admin!")).toBeVisible();
});
