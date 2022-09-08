import { IDatabaseClient } from "./IDatabaseClient";
import { stderr } from "process";
import { EventStream, LDESClient, newEngine } from "@treecg/actor-init-ldes-client";
import { loadState } from "./utils";
import { App } from "./App";
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
import Configuration from "./Configuration";

export const FOLDER_OF_STATE = resolve(`${__dirname}/../.ldes`);
export const LOCATION_OF_STATE = `${FOLDER_OF_STATE}/state.json`;
export const LOCATION_OF_CONFIG_STATE = `${FOLDER_OF_STATE}/config.json`;

export type CliArgv = string[];

export interface IAppRunnerArgs {
  database: string;
}

export class AppRunner {
  private readonly logger = getLoggerFor(this);

  public runCliSync(): void {
    this.runCli().catch((error): never => {
      stderr.write(error.message);
      process.exit(1);
    });
  }

  public async runCli(): Promise<void> {
    const cliConfig = new Configuration('config.json');
    await this.persistConfig(cliConfig);

    const config = new Configuration(LOCATION_OF_CONFIG_STATE);
    const app = this.createApp(config);

    try {
      app.init().then(() => app.start())
    } catch (error: unknown) {
      console.log(error);
      await app.stop();
    }

    setTimeout(() => {
      this.logger.info(`Pausing the LDES client.`);
      app.stop();
    }, 3_300_000);  // 55 minutes
  }

  private createApp(config: Configuration): App {
    const dbClient = this.getDbClient(config.database.type);
    const ldesOptions = this.getLdesOptions(config.database.type);

    const ldesClient: LDESClient = newEngine();
    let ldes: EventStream;

    const state = loadState(LOCATION_OF_STATE);

    if (!state) {
      ldes = ldesClient.createReadStream(config.ldes, ldesOptions)
    } else {
      ldes = ldesClient.createReadStream(config.ldes, ldesOptions, state);
    }

    return new App(dbClient, ldes, config);
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

  private async persistConfig(config: Configuration): Promise<void> {
    if (!existsSync(FOLDER_OF_STATE)) {
      await mkdir(FOLDER_OF_STATE, { recursive: true })
    }
    return await writeFile(LOCATION_OF_CONFIG_STATE, JSON.stringify(config));
  }
}