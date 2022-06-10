import { Mongo } from "../lib/Mongo"
import { EventStream, LDESClient, newEngine } from "@treecg/actor-init-ldes-client";
import { loadState, saveState } from "../lib/utils";
import { gipodContext } from "../lib/gipodContext";

const FOLDER_OF_STATE = `./.ldes`;
const LOCATION_OF_STATE = `./.ldes/state.json`;

const run = async (): Promise<void> => {
  const url = 'https://private-api.gipod.beta-vlaanderen.be/api/v1/ldes/mobility-hindrances';

  // TODO: add JSON-LD context option ocne it is fixed in the client
  //FIXME: locally change jsonLdContext type from ContextDefinition to any
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
  ldes.on('pause', () => {
    saveState(FOLDER_OF_STATE, LOCATION_OF_STATE, ldes.exportState())
    dbClient.close();
  });
  ldes.on('end', () => {
    saveState(FOLDER_OF_STATE, LOCATION_OF_STATE, ldes.exportState())
    dbClient.close();
  });
  ldes.on('error', console.error);
}

run().catch(error => console.error(error));