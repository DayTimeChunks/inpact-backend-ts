import { Pool, QueryConfig, QueryResult, PoolClient } from 'pg';
import { RdsConfig } from '../conf/BaseConfiguration'
import * as QueryStream from 'pg-query-stream';

export type QueryResultRow = { [key: string]: any };

export class PostgresService {
  private readonly pool: Pool;

  constructor(configuration: RdsConfig) {
    this.pool = new Pool(configuration);
  }

  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  public releaseClient(client: PoolClient): void {
    client.release();
  }

  async testConnection(): Promise<QueryResult> {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query('SELECT NOW()')
      return rows[0].now
    } finally {
      client.release();
    }
  }

  public async query(sql: QueryConfig): Promise<QueryResult> {
    const client = await this.pool.connect();
    try {
      return await client.query(sql);
    } finally {
      client.release();
    }
  }

  public async queryRaw(sql: string, params?: any[]): Promise<QueryResult> {
    const client = await this.pool.connect();
    try {
      return await client.query(sql, params);
    } finally {
      client.release();
    }
  }

  public async queryArray(sql: string, params?: any[]): Promise<QueryResultRow[]> {
    const { rows } = await this.queryRaw(sql, params);
    return rows;
  }

  public performQueryStream(client: PoolClient, query: QueryConfig) {
    const queryStream = new QueryStream(query.text, query.values);
    return client.query(queryStream);
  }

  async queryBulk(sql: QueryConfig, client: PoolClient): Promise<QueryResult | void> {
    try {
      return await client.query(sql);
    } catch (err) {
      console.error("Error on queryBulk", err)
    }
  }
}
