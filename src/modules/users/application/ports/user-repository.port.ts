export interface UserRepositoryPort {
  existsById(userId: string): Promise<boolean>;
}
