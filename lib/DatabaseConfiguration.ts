export interface DatabaseConfiguration {
  type: string;
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  connectionString: string;
}