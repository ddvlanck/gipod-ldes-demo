import { Mongo } from "../lib/Mongo"
import { EventStream, LDESClient, newEngine } from "@treecg/actor-init-ldes-client";
import { loadState, onLdesClientPauzed, saveState } from "../lib/utils";
import { gipodContext } from "../lib/gipodContext";
import * as cron from 'node-cron';
import moment from "moment";

export const FOLDER_OF_STATE = `${__dirname}/.ldes`;
export const LOCATION_OF_STATE = `${FOLDER_OF_STATE}/state.json`;

const startDate = new Date(Date.now());
const startingMinute = moment(startDate).add(65, 'seconds').toDate().getMinutes();

console.log(`Script was started at ${startDate.toISOString()}`);
console.log(`Cron job will be started in 1 minute...`);

cron.schedule(`${startingMinute} * * * *`, async () => {
  console.log(`Start syncing at ${new Date(Date.now())}`);
  const url = 'https://private-api.gipod.beta-vlaanderen.be/api/v1/ldes/mobility-hindrances';

  let options = {
    "pollingInterval": 5000, // millis
    "representation": "Object",
    "emitMemberOnce": true,
    "disableSynchronization": true,
    "jsonLdContext": gipodContext
  };

  const ldesClient: LDESClient = newEngine();
  let ldes: EventStream;

  const state = loadState(LOCATION_OF_STATE);

  if (!state) {
    ldes = ldesClient.createReadStream(url, options)
  } else {
    ldes = ldesClient.createReadStream(url, options, state);
  }

  const dbClient = Mongo.getInstance();
  await dbClient.connect();

  const tasks: Promise<void>[] = [];

  ldes.on('data', (member) => tasks.push(dbClient.handleMember(member)));
  ldes.on('pause', () => onLdesClientPauzed(ldes, dbClient, tasks));
  ldes.on('end', () => onLdesClientPauzed(ldes, dbClient, tasks));
  ldes.on('error', console.error);

  // Pause when exiting with CTRL+C
  process.on('SIGINT', async () => {
    console.log("Caught interrupt signal. Pausing the LDES client to save state.");
    ldes.pause();
    await dbClient.close();
    process.exit(0);
  });

  setTimeout(() => {
    console.log(`Time for the LDES client to take a break! [${new Date(Date.now())}]`);
    ldes.pause();
  }, 3_300_000);  // 55 minutes
});
