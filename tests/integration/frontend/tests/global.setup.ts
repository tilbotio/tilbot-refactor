import { test as setup } from '@playwright/test';
import { ContainerManager } from '../container_manager';

setup('start containers', async ({ }) => {
    setup.setTimeout(120_000);
    console.log('starting containers...');

    await ContainerManager.startEnvironment();

    console.log('loaded!');

});