import { test, expect } from "@playwright/test";
import { UserModel } from "../../../../backend/db/user";
import mongoose, { ConnectOptions } from "mongoose";

test("login admin", async ({ page }) => {
  // Empty all accounts from DB
  await mongoose.connect("mongodb://127.0.0.1:27017/tilbot", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);
  await UserModel.deleteMany();

  // Go to dashboard login
  await page.goto("http://localhost:5173/login/");

  await expect(
    page.getByText(
      'No admin account was found, so I created it. Log in with username "admin", password "admin"'
    )
  ).toBeVisible();

  // Fill in default username and password
  await page.locator("#txt_username").fill("admin");
  await page.locator("#txt_pass").fill("admin");

  // Click the login button
  await page.getByRole("button").click();

  // Expect the user to log in and the welcome text to show on the next page.
  await expect(page.getByText("Welcome, admin!")).toBeVisible();
});
