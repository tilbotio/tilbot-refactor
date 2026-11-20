import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { test, expect } from "@playwright/test";

test("the mounted administrator secret is restricted to the backend user", () => {
  const secret = process.env.ADMIN_PASSWORD_FILE;
  if (secret !== "/run/private/initial_admin_password") {
    test.skip(true, "Requires the Compose secret volume");
    return;
  }

  const file = statSync(secret);
  const directory = statSync("/run/private");
  expect(file.uid).toBe(1000);
  expect(file.mode & 0o777).toBe(0o400);
  expect(directory.uid).toBe(1000);
  expect(directory.mode & 0o777).toBe(0o700);
  expect(existsSync("/run/secrets/initial_admin_password")).toBe(false);

  if (process.platform === "linux" && process.getuid?.() === 0) {
    const probe = spawnSync(process.execPath, [
      "-e",
      "try { require('node:fs').accessSync(process.env.ADMIN_PASSWORD_FILE); process.exit(1); } catch (e) { if (e.code !== 'EACCES') process.exit(2); }",
    ], { uid: 65534, gid: 65534 });
    expect(probe.status).toBe(0);
  }
});
