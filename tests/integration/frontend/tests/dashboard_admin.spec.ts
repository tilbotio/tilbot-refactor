import { test, expect } from '@playwright/test';
import { UserModel } from '../../../../backend/db/user';
import mongoose from 'mongoose';

/*test('login button', async ({ page }) => {
    await page.goto('http://localhost:5173/login/');

    // Find login button.
    await expect(page.getByText('Login')).toBeVisible();
});

test('login button 2', async ({ page }) => {
    await page.goto('http://localhost:5173/login/');

    // Find login button.
    await expect(page.getByText('Login')).toBeVisible();
});*/

test('login admin', async ({ page }) => {
    console.log('===');
    console.log(process.env.compose);
    // Empty all accounts from DB
    await mongoose.connect("mongodb://127.0.0.1:27017/tilbot", { useNewUrlParser: true, useUnifiedTopology: true });
    await UserModel.deleteMany();
    let admin = await UserModel.adminAccountExists();
    console.log(admin + ' admin account!!!!');

    //const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    //await delay(1000);


    // Go to dashboard login    
    await page.goto('http://localhost:5173/login/');

    //await delay(1000);   

    await expect(page.getByText('No admin account was found, so I created it. Log in with username "admin", password "admin"')).toBeVisible();

    // Fill in default username and password
    await page.locator("#txt_username").fill('admin');
    await page.locator("#txt_pass").fill('admin');

    // Click the login button
    await page.getByRole("button").click();

    // Expect the user to log in and the welcome text to show on the next page.
    await expect(page.getByText('Welcome, admin!')).toBeVisible();
});