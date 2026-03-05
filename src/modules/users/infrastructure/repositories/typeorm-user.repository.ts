import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepositoryPort } from '../../application/ports/user-repository.port';
import { UserEntity } from '../persistence/entities/user.entity';

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  existsById(userId: string): Promise<boolean> {
    return this.dataSource.getRepository(UserEntity).exists({ where: { id: userId } });
  }
}

