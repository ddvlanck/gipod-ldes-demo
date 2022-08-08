import { readFileSync } from "fs";

export default class Configuration {
  public database: { type: string, user: string, password: string, host: string, port: number, database: string, connectionString: string };
  public url: string;

  public constructor() {
    const raw = readFileSync('config.json', 'utf-8');
    const config = JSON.parse(raw.trim());

    this.database = config.database;
    this.url = config.ldes;

    this.database.type = process.env.DB_TYPE || this.database.type;
    this.database.user = process.env.DB_USER || this.database.user;
    this.database.password = process.env.DB_PASSWORD || this.database.password;
    this.database.host = process.env.DB_HOST || this.database.host;
    this.database.database = process.env.DB_DATABASE || this.database.database;

    if ('DB_PORT' in process.env) {
      this.database.port = parseInt(process.env.DB_PORT!);
    }
  }
}

export const configuration = new Configuration();