#!/usr/bin/env node
import { AppRunner } from '../lib/AppRunner';
import { configuration } from '../lib/Configuration';

const run = async (): Promise<void> => {
  const app = new AppRunner();
  await app.create(configuration.database.type, configuration.url).then(() => app.run());
}

run().catch(error => console.error(error));