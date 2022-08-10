import { EventStream } from "@treecg/actor-init-ldes-client";
import Configuration from "./Configuration";
import { IDatabaseClient } from "./IDatabaseClient";
import { getLoggerFor } from "./logging/LogUtils";
import { onLdesClientPauzed } from "./utils";

export class App {
  private readonly logger = getLoggerFor(this);

  private readonly dbClient: IDatabaseClient;
  private readonly ldes: EventStream;
  private readonly config: Configuration;

  public constructor(dbClient: IDatabaseClient, ldes: EventStream, config: Configuration) {
    this.dbClient = dbClient;
    this.ldes = ldes;
    this.config = config;
  }

  public async init(): Promise<void> {
    await this.dbClient.provision(this.config.database);
  }

  public async start(): Promise<void> {
    this.logger.info('Start syncing with the LDES.');
    const tasks: Promise<void>[] = [];

    this.ldes.on('data', (member) => tasks.push(this.dbClient.handleMember(member)));
    this.ldes.on('pause', () => onLdesClientPauzed(this.ldes, this.dbClient, tasks));
    this.ldes.on('end', () => onLdesClientPauzed(this.ldes, this.dbClient, tasks));
    this.ldes.on('error', (error) => {
      console.log(error);
      onLdesClientPauzed(this.ldes, this.dbClient, tasks);
    });
  }

  public async stop(): Promise<void> {
    this.ldes.pause();
  }
}