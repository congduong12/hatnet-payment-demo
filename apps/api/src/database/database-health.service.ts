import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseHealthService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async check(): Promise<{ status: 'ok'; database: 'postgres'; timestamp: string }> {
    await this.dataSource.query('SELECT 1');

    return {
      status: 'ok',
      database: 'postgres',
      timestamp: new Date().toISOString(),
    };
  }
}
