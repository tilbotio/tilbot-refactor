import { test as teardown } from "@playwright/test";
import { containerManager } from "../container_manager";

teardown("stop containers", async ({}) => {
  await containerManager.stopEnvironment();
});
