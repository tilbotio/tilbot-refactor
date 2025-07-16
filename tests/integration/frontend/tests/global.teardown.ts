import { test as teardown } from "@playwright/test";
import { ContainerManager } from "../container_manager";

teardown("stop containers", async ({}) => {
  await ContainerManager.stopEnvironment();
});
