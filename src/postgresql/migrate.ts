// import { Pool, PoolClient } from 'pg'
import { chain } from 'lodash'
import * as chalk from 'chalk'
import { each } from 'bluebird'
import { BaseConfiguration } from '../conf';
import * as migrations from './migrations'
import { PostgresService } from '../services';
import { PoolClient } from 'pg';

export async function migrate(configuration: BaseConfiguration) {
  console.log("configuration: ", configuration.InpactRdsConfig)
  const inpactService = new PostgresService(configuration.InpactRdsConfig)
  const inpactClient = await inpactService.getClient()

  try {
    await createMigrationsIfNeeded(inpactClient)
    await runPendingMigrations(inpactClient)
  } finally {
    inpactClient.release()
  }
}

async function createMigrationsIfNeeded(inpactClient: PoolClient) {
  if (!await existsSchema(inpactClient, 'migrations')) {
    throw new Error('migrations schema does not exist')
  }
  if (!await existsTable(inpactClient, 'migrations', 'migrations')) {
    await inpactClient.query(`
      CREATE TABLE migrations.migrations (
        id varchar(255) PRIMARY KEY,
        success boolean NOT NULL,
        error text
      )
    `)
  }
}

async function runPendingMigrations(inpactClient: PoolClient) {
  const { rows: completed } = await inpactClient.query(`
    SELECT id, success, error
     FROM migrations.migrations
     ORDER BY id
   `)

  const failedMigration = completed.find(mr => !mr.success);
  if (failedMigration) {
    throw new Error(`Failed migration ${failedMigration.id}, please fix, then delete row like:
      DELETE FROM migrations.migrations
	    WHERE id = '${failedMigration.id}';`)
  }

  const migrationsToApply = chain(migrations)
    .toPairs()
    .filter(([id]) => !completed.some(mr => mr.id == id))
    .orderBy(([id]) => id)
    .value()

  if (!migrationsToApply.length) {
    console.info(chalk.green('All migrations have been applied'))
  }

  await each(migrationsToApply, async ([id, fn]) => {
    console.info(chalk.green(`Applying ${id}`))
    try {
      await fn(inpactClient)
    } catch (ex) {
      await storeMigrationResult(inpactClient, id, false, ex.stack)
      console.info(chalk.red(`Failed ${id}: ${ex.message}`))
      throw ex
    }
    await storeMigrationResult(inpactClient, id, true)
  })
}

async function storeMigrationResult(inpactClient: PoolClient, id: string, success: boolean, error = null) {
  await inpactClient.query(`
        INSERT INTO migrations.migrations
          (id, success, error)
          VALUES
          ($1, $2, $3)
        `,
    [id, success, error])
}

async function existsSchema(client: PoolClient, schemaName: string) {
  const { rows: [res] } = await client.query(`
  SELECT EXISTS (
    SELECT 1
      FROM pg_namespace
      WHERE nspname = $1
  )`,
    [schemaName])
  return res.exists
}

async function existsTable(client: PoolClient, tableName: string, schemaName = 'public') {
  const { rows: [res] } = await client.query(`
      SELECT EXISTS (
        SELECT 1
          FROM pg_tables
          WHERE schemaname = $1
          AND tablename = $2
      )`,
    [schemaName, tableName])
  return res.exists
}