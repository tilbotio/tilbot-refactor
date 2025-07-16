import { test as setup } from "@playwright/test";
import { ContainerManager } from "../container_manager";

setup("start containers", async ({}) => {
  setup.setTimeout(120_000);
  await ContainerManager.startEnvironment();
});
