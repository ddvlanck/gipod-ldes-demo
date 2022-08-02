import { IDatabaseClient } from "./IDatabaseClient";
import { stderr } from "process";
import { EventStream, LDESClient, newEngine } from "@treecg/actor-init-ldes-client";
import { loadState } from "./utils";
import { App } from "./App";
import yargs from "yargs";
import { Mongo } from "./database-clients/Mongo";
import { Postgis } from "./database-clients/Postgis";
import { gipodContext } from "./gipodContext";
import moment from "moment";
import * as cron from 'node-cron';

export const FOLDER_OF_STATE = `${__dirname}/.ldes`;
export const LOCATION_OF_STATE = `${FOLDER_OF_STATE}/state.json`;

export type CliArgv = string[];

export interface IAppRunnerArgs {
  database: string;
}

export class AppRunner {
  public runCliSync(process: NodeJS.Process): void {
    this.runCli(process.argv).catch((error): never => {
      stderr.write(error.message);
      process.exit(1);
    });
  }

  public async runCli(argv: CliArgv): Promise<void> {
    const startDate = new Date(Date.now());
    const startingMinute = moment(startDate).add(65, 'seconds').toDate().getMinutes();

    cron.schedule(`${startingMinute} * * * *`, async () => {
      const app = await this.createCli(argv);
      try {
        app.init().then(() => app.start())
      } catch (error: unknown) {
        await app.stop();
      }

      setTimeout(() => {
        app.stop();
      }, 3_300_000);  // 55 minutes
    })
  }

  public async createCli(argv: CliArgv = process.argv): Promise<App> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/cli-runner.js [args]')
      .option('u', { alias: 'url', describe: 'The URL of the LDES endpoint', type: 'string' })
      .option('d', { alias: 'databaseType', describe: 'The database to which the LDES members will be written', choices: ['mongo', 'postgis'] })
      .demandOption(['u', 'd'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    const dbClient = this.getDbClient(params.d);
    const ldesOptions = this.getLdesOptions(params.d);

    const ldesClient: LDESClient = newEngine();
    let ldes: EventStream;

    const state = loadState(LOCATION_OF_STATE);

    if (!state) {
      ldes = ldesClient.createReadStream(params.u, ldesOptions)
    } else {
      ldes = ldesClient.createReadStream(params.u, ldesOptions, state);
    }

    return new App(dbClient, ldes);
  }

  private getDbClient(type: string): IDatabaseClient {
    switch (type) {
      case 'mongo':
        return Mongo.getInstance();

      case 'postgis':
        return Postgis.getInstance();

      default:
        throw new Error(`Database type ${type} is not supported.`)
    }
  }

  private getLdesOptions(type: string): any {
    let representation;
    switch (type) {
      case 'mongo':
        representation = 'Object';
        break;

      case 'postgis':
        representation = 'Quads';
        break;

      default:
        throw new Error(`Database type ${type} is not supported.`)
    }

    return {
      pollingInterval: 5000,
      representation,
      emitMemberOnce: true,
      disableSynchronization: true,
      jsonLdContext: gipodContext,
    }
  }
}