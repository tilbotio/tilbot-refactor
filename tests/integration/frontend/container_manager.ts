import { DockerComposeEnvironment } from 'testcontainers';
import { getContainerRuntimeClient } from "testcontainers";

abstract class ContainerManager {
    
    private static composeFilePath = "./";
    private static composeFile = "docker-compose.yml";

    public static async startEnvironment() {
        // Start the Docker containers      
        //ContainerManager.environment = await new DockerComposeEnvironment(composeFilePath, composeFile).up(); 
        const environment = await new DockerComposeEnvironment(ContainerManager.composeFilePath, ContainerManager.composeFile).withProjectName("tilbot").up(); 
        //console.log(ContainerManager.environment);
        //console.log(process.env.compose);
    }

    public static async stopEnvironment() {

        const containerRuntimeClient = await getContainerRuntimeClient();
        await containerRuntimeClient.compose.down({filePath: ContainerManager.composeFilePath, files: ContainerManager.composeFile, projectName: "tilbot"}, {timeout: 30000, removeVolumes: true});

        console.log(containerRuntimeClient.info);        
    }
}

export { ContainerManager }