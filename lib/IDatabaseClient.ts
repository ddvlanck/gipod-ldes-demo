export interface IDatabaseClient {
  handleMember: (member: any) => Promise<void>;
}