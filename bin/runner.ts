#!/usr/bin/env node
import { readFile } from 'fs/promises';
import { AppRunner } from '../lib/AppRunner';

const run = async (): Promise<void> => {
  const raw = await readFile('config.json', 'utf-8');
  const config = JSON.parse(raw);

  const database = process.env.DATABASE || config.database;
  const url = process.env.LDES || config.ldes;

  const app = new AppRunner();
  await app.create(database, url).then(() => app.run());
}

run().catch(error => console.error(error));