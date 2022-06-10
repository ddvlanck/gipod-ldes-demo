import { EventStream } from "@treecg/actor-init-ldes-client";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "fs";
import { FOLDER_OF_STATE, LOCATION_OF_STATE } from "../bin/runner";
import { Mongo } from "./Mongo";

export async function onLdesClientPauzed(ldes: EventStream, dbClient: Mongo): Promise<void> {
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