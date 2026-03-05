export interface ClientRepositoryPort {
  existsById(clientId: string): Promise<boolean>;
}
