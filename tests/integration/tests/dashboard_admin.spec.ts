import { test, expect } from '@playwright/test';

test('login button', async ({ page }) => {
    await page.goto('http://localhost:5173/login/');

    // Find login button.
    await expect(page.getByText('Login')).toBeVisible();
});

test('login button 2', async ({ page }) => {
    await page.goto('http://localhost:5173/login/');

    // Find login button.
    await expect(page.getByText('Login')).toBeVisible();
});

test('login admin', async ({ page }) => {
    // @TODO: Empty DB
    
    await page.goto('http://localhost:5173/login/');

    //await page.getByRole("textbox", {name: "username"}).fill('admin');
    //await page.getByRole("textbox", {name: "password"}).fill('admin');
    await page.locator("#txt_username").fill('admin');
    await page.locator("#txt_pass").fill('admin');

    await page.getByRole("button").click();

    // Find login button.
    await expect(page.getByText('Welcome, admin!')).toBeVisible();
});