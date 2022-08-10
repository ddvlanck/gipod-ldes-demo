import { readFileSync } from "fs";
import { DatabaseConfiguration } from "./DatabaseConfiguration";

export default class Configuration {
  public database: DatabaseConfiguration;
  public ldes: string;

  public constructor(path: string) {
    const raw = readFileSync(path, 'utf-8');
    const config = JSON.parse(raw.trim());

    this.database = config.database;
    this.ldes = config.ldes;

    this.database.type = process.env.DB_TYPE || this.database.type;
    this.database.user = process.env.DB_USER || this.database.user;
    this.database.password = process.env.DB_PASSWORD || this.database.password;
    this.database.host = process.env.DB_HOST || this.database.host;
    this.database.database = process.env.DB_DATABASE || this.database.database;

    if ('DB_PORT' in process.env) {
      this.database.port = parseInt(process.env.DB_PORT!);
    }

    this.database.connectionString = process.env.DB_CONNECTION_STRING || this.database.connectionString;
  }
}