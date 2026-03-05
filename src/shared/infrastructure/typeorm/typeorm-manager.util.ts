import { DataSource, EntityManager } from 'typeorm';
import { TransactionContext } from '../../application/ports/transaction-manager.port';

export const resolveManager = (
  dataSource: DataSource,
  context?: TransactionContext,
): EntityManager => {
  return context?.manager ?? dataSource.manager;
};
