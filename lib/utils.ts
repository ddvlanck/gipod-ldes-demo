import { existsSync, readFileSync, mkdirSync, writeFileSync } from "fs";

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