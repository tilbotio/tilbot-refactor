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

