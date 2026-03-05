import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionContext, TransactionManagerPort } from '../../application/ports/transaction-manager.port';

@Injectable()
export class TypeOrmTransactionManagerAdapter implements TransactionManagerPort {
  constructor(private readonly dataSource: DataSource) {}

  runInTransaction<T>(operation: (context: TransactionContext) => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) => operation({ manager }));
  }
}

