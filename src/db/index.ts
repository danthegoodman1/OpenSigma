import { Pool } from 'pg'
import Stripe from 'stripe'

export let pool: Pool

export async function ConnectDB() {
  pool = new Pool({
    connectionString: process.env.DSN,
    connectionTimeoutMillis: 5000
  })
}

const tableName = `${process.env.DB_SCHEMA || "public"}.${process.env.DB_TABLE || "stripe_events"}`

export async function CreateTableIfNotExists() {
  return pool.query(`
    CREATE TABLE IF NOT EXISTS  ${tableName} (
      type TEXT NOT NULL,
      id TEXT NOT NULL,
      version INT8 NOT NULL,
      data JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (id, version)
    )
  `)
}

/**
 * Support for timescaledb hypertables.
 */
export async function CreateHypertable() {
  // TODO: this
}

export interface InsertEventOpts {
  /**
   * Default `true`. Will drop events if they already exist in the DB. Used for backfill.
   */
  insertOnConflict?: boolean
}

/**
 * Inserts an event automatically incrementing the version number as needed
 */
export async function InsertEvent(event: Stripe.Event, opts?: InsertEventOpts) {
  return pool.query(`
    INSERT INTO ${tableName} (type, id, version, data)
    VALUES ($1, $2, 1, $3)
    ON CONFLICT (id) DO
      ${opts?.insertOnConflict === false ? `NOTHING` :
      `INSERT INTO ${tableName} (type, id, version, data)
      VALUES ($1, $2, (
        SELECT MAX(version)+1
        FROM ${tableName}
        WHERE id = $1
      ), $)`}
  `, [event.type, event.id, event])
}
