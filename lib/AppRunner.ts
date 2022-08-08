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
import { Neo4j } from "./database-clients/Neo4j";
import { mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { resolve } from "path";
import { getLoggerFor } from "./logging/LogUtils";

export const FOLDER_OF_STATE = resolve(`${__dirname}/../.ldes`);
export const LOCATION_OF_STATE = `${FOLDER_OF_STATE}/state.json`;
export const LOCATION_OF_CONFIG_STATE = `${FOLDER_OF_STATE}/config.json`;

export type CliArgv = string[];

export interface IAppRunnerArgs {
  database: string;
}

export class AppRunner {
  private readonly logger = getLoggerFor(this);

  public runCliSync(process: NodeJS.Process): void {
    this.runCli(process.argv).catch((error): never => {
      stderr.write(error.message);
      process.exit(1);
    });
  }

  public async runCli(argv: CliArgv): Promise<void> {
    await this.createCli(argv).then(() => this.run());
  }

  public async run(): Promise<void> {
    const startDate = new Date(Date.now());
    const startingMinute = moment(startDate).add(65, 'seconds').toDate().getMinutes();
    this.logger.info(`Waiting for cron job to start.`);

    cron.schedule(`${startingMinute} * * * *`, async () => {
      const raw = await readFile(LOCATION_OF_CONFIG_STATE, 'utf8');
      const config = JSON.parse(raw);

      const app = this.createApp(config.database, config.url);
      try {
        app.init().then(() => app.start())
      } catch (error: unknown) {
        console.log(error);
        await app.stop();
      }

      setTimeout(() => {
        app.stop();
      }, 3_300_000);  // 55 minutes
    });
  }

  public async createCli(argv: CliArgv = process.argv): Promise<void> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/cli-runner.js [args]')
      .option('u', { alias: 'url', describe: 'The URL of the LDES endpoint', type: 'string' })
      .option('d', { alias: 'databaseType', describe: 'The database to which the LDES members will be written', choices: ['mongo', 'postgis', 'neo4j'] })
      .demandOption(['u', 'd'])
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();
    this.logger.debug(`Received following params: ${params}`);
    await this.persistConfig(params.d, params.u);
  }

  public async create(database: string, url: string): Promise<void> {
    await this.persistConfig(database, url);
  }

  private createApp(database: string, url: string): App {
    const dbClient = this.getDbClient(database);
    const ldesOptions = this.getLdesOptions(database);

    const ldesClient: LDESClient = newEngine();
    let ldes: EventStream;

    const state = loadState(LOCATION_OF_STATE);

    if (!state) {
      ldes = ldesClient.createReadStream(url, ldesOptions)
    } else {
      ldes = ldesClient.createReadStream(url, ldesOptions, state);
    }

    return new App(dbClient, ldes);
  }

  private getDbClient(type: string): IDatabaseClient {
    switch (type) {
      case 'mongo':
        return Mongo.getInstance();

      case 'postgis':
        return Postgis.getInstance();

      case 'neo4j':
        return Neo4j.getInstance();

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
      case 'neo4j':
        representation = 'Quads';
        break;

      default:
        throw new Error(`Ldes option for database ${type} not supported.`)
    }

    return {
      pollingInterval: 5000,
      representation,
      emitMemberOnce: true,
      disableSynchronization: true,
      jsonLdContext: gipodContext,
    }
  }

  private async persistConfig(database: string, url: string): Promise<void> {
    if (!existsSync(FOLDER_OF_STATE)) {
      await mkdir(FOLDER_OF_STATE, { recursive: true })
    }
    return await writeFile(LOCATION_OF_CONFIG_STATE, JSON.stringify({ database, url }));
  }
}