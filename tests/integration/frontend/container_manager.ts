import {
  DockerComposeEnvironment,
  getContainerRuntimeClient,
} from "testcontainers";

class ContainerManager {
  private static _instance: ContainerManager;
  private composeFilePath: string = "../../../";
  private composeFile: string = "docker-compose.yml";

  private constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  public async startEnvironment() {
    // Start the Docker containers
    await new DockerComposeEnvironment(this.composeFilePath, this.composeFile)
      .withProjectName("tilbot-test")
      .up();
  }

  public async stopEnvironment() {
    const containerRuntimeClient = await getContainerRuntimeClient();
    await containerRuntimeClient.compose.down(
      {
        filePath: this.composeFilePath,
        files: this.composeFile,
        projectName: "tilbot-test",
      },
      { timeout: 30000, removeVolumes: true }
    );
  }
}

const instance = ContainerManager.Instance;
export { instance as ContainerManager };
