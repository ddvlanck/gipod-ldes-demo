#!/usr/bin/env node
import { readFile } from 'fs/promises';
import { AppRunner } from '../lib/AppRunner';

const run = async (): Promise<void> => {
  const raw = await readFile('config.json', 'utf-8');
  const config = JSON.parse(raw);

  const app = new AppRunner();
  await app.create(config.database, config.url);
  await app.run();
}

run().catch(error => console.error(error));