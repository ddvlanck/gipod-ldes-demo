import { DatabaseConfiguration } from "./DatabaseConfiguration";

export interface IDatabaseClient {
  provision: (config: DatabaseConfiguration) => Promise<void>;
  handleMember: (member: any) => Promise<void>;
  close: () => Promise<void>
}