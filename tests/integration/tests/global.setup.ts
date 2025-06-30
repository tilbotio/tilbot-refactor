import { test as setup } from '@playwright/test';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { MongoDBContainer } from '@testcontainers/mongodb';

setup('start test mongo', async ({ }) => {
    const mongodbContainer = await new MongoDBContainer("mongo:5").withReuse().start();
});

setup('start containers', async ({ }) => {
    setup.setTimeout(120_000);
    console.log('starting containers...');

    // Start the Docker containers
    const composeFilePath = "../../";
    const composeFile = "docker-compose.yml";
    
    //const environment = await new DockerComposeEnvironment(composeFilePath, composeFile).withWaitStrategy("frontend-1", Wait.forLogMessage(".*Local.*")).up(["frontend", "backend"]); 
    
    // I cannot get the wait strategies to work, so I have a hard-coded 60 sec. delay for the Docker containers to spin up now.
    const environment = new DockerComposeEnvironment(composeFilePath, composeFile).up(["frontend", "backend"]); 
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    await delay(60000);

    console.log('loaded!');

});