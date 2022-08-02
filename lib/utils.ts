import { EventStream } from "@treecg/actor-init-ldes-client";
import { existsSync, readFileSync, mkdirSync, writeFileSync, createReadStream } from "fs";
import { FOLDER_OF_STATE, LOCATION_OF_STATE } from "../lib/AppRunner";
import { Mongo } from "./database-clients/Mongo";
import { Quad } from '@rdfjs/types';
import rdfParser from "rdf-parse";
import * as N3 from 'n3';
import { DataFactory } from "n3";
import { IDatabaseClient } from "./IDatabaseClient";

export async function onLdesClientPauzed(ldes: EventStream, dbClient: IDatabaseClient, tasks: Promise<void>[]): Promise<void> {
  // Waiting for all tasks to be finished before closing the client.
  await Promise.all(tasks);

  saveState(FOLDER_OF_STATE, LOCATION_OF_STATE, ldes.exportState());
  await dbClient.close();
}

export function loadState(stateFile: string) {
  if (existsSync(stateFile)) {
    return JSON.parse(readFileSync(stateFile).toString());
  }
  return null;
}

export function saveState(stateFolder: string, stateFile: string, clientState: any) {
  if (!existsSync(stateFolder)) {
    mkdirSync(stateFolder, { recursive: true });
  }

  writeFileSync(stateFile, JSON.stringify(clientState));
}