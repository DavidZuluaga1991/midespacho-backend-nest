import { EntityManager } from 'typeorm';

export interface TransactionContext {
  manager: EntityManager;
}

export interface TransactionManagerPort {
  runInTransaction<T>(
    operation: (context: TransactionContext) => Promise<T>,
  ): Promise<T>;
}
