import { IDatabaseClient } from "../IDatabaseClient";
import { Driver, driver, auth, Session } from 'neo4j-driver';
import * as N3 from 'n3';
import { getLoggerFor } from "../logging/LogUtils";
import { DatabaseConfiguration } from "../DatabaseConfiguration";
const tcpPortUsed = require('tcp-port-used');

export class Neo4j implements IDatabaseClient {
  private readonly logger = getLoggerFor(this);
  private static instance: Neo4j;
  private _client: Driver | undefined;

  private constructor() {}

  public static getInstance(): Neo4j {
    if (!Neo4j.instance) {
      Neo4j.instance = new Neo4j();
    }

    return Neo4j.instance;
  }

  private get client(): Driver {
    if (!this._client) {
      throw new Error(`Neo4j client has not been initialized yet.`);
    }
    return this._client;
  }

  private set client(value: Driver) {
    this._client = value;
  }

  public async provision(config: DatabaseConfiguration): Promise<void> {
    this.client = driver(
      config.connectionString,
      auth.basic(config.user, config.password),
    );

    await tcpPortUsed.waitUntilUsedOnHost(7474, 'localhost', 30_000, 300_000) // Try every 30 seconds, 5 minutes long
      .then(() => this.logger.info('Database is available and can be used.'))
      .catch((error: any) => { this.logger.error('Unable to connect to database'); console.error(error) });
    const session = this.createSession();

    try {
      await session.run(
        'CALL n10s.graphconfig.init({ handleVocabUris: "KEEP", handleMultival: "ARRAY", handleRDFTypes: "NODES" });'
      );
    } catch (error: unknown) {
      console.log(error);
    } finally {
      await session.close();
    }
  }

  public async close(): Promise<void> {
    if (!this._client) {
      throw new Error('Trying to close client while already closed.');
    }
    return this._client.close();
  }

  // FIXME: Neo4J throws error when a string contains apostrophe
  public async handleMember(member: any): Promise<void> {
    const writer = new N3.Writer({ format: 'text/turtle' });
    writer.addQuads(member.quads);

    writer.end((error, turtle) => {
      if (error) {
        throw error;
      }

      this.addToDatabase(turtle);
    });
  }

  private async addToDatabase(mobilityHindrance: string): Promise<void> {
    const session = this.createSession();

    const INSERT = `
      WITH '${mobilityHindrance}' as payload
      CALL n10s.rdf.import.inline(payload, "Turtle") YIELD terminationStatus, triplesLoaded
      RETURN terminationStatus, triplesLoaded`;

    try {
      await session.run(INSERT);
    } catch (error: unknown) {
      console.log(error);
    } finally {
      await session.close();
    }
  }

  private createSession(): Session {
    return this.client.session({
      database: 'neo4j'
    });
  }
}