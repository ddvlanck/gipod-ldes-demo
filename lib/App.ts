import { EventStream } from "@treecg/actor-init-ldes-client";
import { IDatabaseClient } from "./IDatabaseClient";
import { onLdesClientPauzed } from "./utils";

export class App {
  private readonly dbClient: IDatabaseClient;
  private readonly ldes: EventStream;

  public constructor(dbClient: IDatabaseClient, ldes: EventStream) {
    this.dbClient = dbClient;
    this.ldes = ldes;
  }

  public async init(): Promise<void> {
    await this.dbClient.provision();
  }

  public async start(): Promise<void> {
    const tasks: Promise<void>[] = [];

    this.ldes.on('data', (member) => tasks.push(this.dbClient.handleMember(member)));
    this.ldes.on('pause', () => onLdesClientPauzed(this.ldes, this.dbClient, tasks));
    this.ldes.on('end', () => onLdesClientPauzed(this.ldes, this.dbClient, tasks));
    this.ldes.on('error', console.error);
  }

  public async stop(): Promise<void> {
    this.ldes.pause();
  }
}