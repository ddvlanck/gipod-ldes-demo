import { Mongo } from "../lib/Mongo"
import { EventStream, LDESClient, newEngine } from "@treecg/actor-init-ldes-client";
import { loadState, onLdesClientPauzed, saveState } from "../lib/utils";
import { gipodContext } from "../lib/gipodContext";

export const FOLDER_OF_STATE = `${__dirname}/.ldes`;
export const LOCATION_OF_STATE = `${FOLDER_OF_STATE}/state.json`;



const run = async (): Promise<void> => {
  const url = 'https://private-api.gipod.beta-vlaanderen.be/api/v1/ldes/mobility-hindrances';

  let options = {
    "pollingInterval": 5000, // millis
    "representation": "Object",
    "emitMemberOnce": true,
    "disableSynchronization": true,
    "jsonLdContext": gipodContext
  };

  const dbClient = Mongo.getInstance();
  await dbClient.connect();

  const ldesClient: LDESClient = newEngine();
  let ldes: EventStream;

  const state = loadState(LOCATION_OF_STATE);

  if (!state) {
    ldes = ldesClient.createReadStream(url, options)
  } else {
    ldes = ldesClient.createReadStream(url, options, state);
  }

  ldes.on('data', (member) => dbClient.handleMember(member));
  ldes.on('pause', () => onLdesClientPauzed(ldes, dbClient));
  ldes.on('end', () => onLdesClientPauzed(ldes, dbClient));
  ldes.on('error', console.error);

  // Pause when exiting with CTRL+C
  process.on('SIGINT', async () => {
    console.log("Caught interrupt signal. Pausing the LDES client to save state.");
    ldes.pause();
    await dbClient.close();
  });
}

run().catch(error => console.error(error));