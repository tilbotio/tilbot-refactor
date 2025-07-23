import { _electron as electron } from "playwright";
import { test, expect } from "@playwright/test";

let window;

test.beforeAll(async () => {
  let app = await electron.launch({
    args: ["../../../app/electron-main.cjs", "--no-sandbox"],
  });
  window = await app.firstWindow();
  await window.waitForLoadState();
});

test("check Tilbot load", async () => {
  // Note that this test currently fails even though the title of the Electron window is "Tilbot" --
  // this checks the title of the page that is served within the window!
  await expect(await window.title()).toBe("Tilbot");
});
