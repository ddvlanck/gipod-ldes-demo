import { Pool } from "pg"
import { IDatabaseClient } from "../IDatabaseClient";

export class Postgis implements IDatabaseClient {
  private static instance: Postgis;
  private readonly _pool: Pool;

  private constructor() {
    this._pool = new Pool({
      user: 'ldes',
      password: 'ldes',
      host: 'localhost',
      port: 5432,
      database: 'mobility_hindrance'
    })

    this._pool.on('error', (err) => {
      console.error(err);
    })
  }

  public static getInstance(): Postgis {
    if (!Postgis.instance) {
      Postgis.instance = new Postgis();
    }
    return Postgis.instance;
  }

  public async handleMember(member: any): Promise<void> {
    // TODO
  }

} 