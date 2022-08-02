export interface IDatabaseClient {
  provision: () => Promise<void>;
  handleMember: (member: any) => Promise<void>;
  close: () => Promise<void>
}