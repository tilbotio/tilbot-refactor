import {
  DockerComposeEnvironment,
  getContainerRuntimeClient,
} from "testcontainers";

class ContainerManager {
  private composeFilePath: string = "../../../";
  private composeFile: string = "docker-compose.yml";

  constructor() {}

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

export const containerManager = new ContainerManager();
