import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ClientRepositoryPort } from '../../application/ports/client-repository.port';
import { ClientEntity } from '../persistence/entities/client.entity';

@Injectable()
export class TypeOrmClientRepository implements ClientRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  existsById(clientId: string): Promise<boolean> {
    return this.dataSource.getRepository(ClientEntity).exists({ where: { id: clientId } });
  }
}

