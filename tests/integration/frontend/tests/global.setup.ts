import { test as setup } from "@playwright/test";
import { containerManager } from "../container_manager";

setup("start containers", async ({}) => {
  setup.setTimeout(120_000);
  await containerManager.startEnvironment();
});
