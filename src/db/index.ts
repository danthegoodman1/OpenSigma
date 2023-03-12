import { Pool } from 'pg'

export let pool: Pool

export async function ConnectDB() {
  pool = new Pool({
    connectionString: process.env.DSN,
    connectionTimeoutMillis: 5000
  })
}

export async function CreateTableIfNotExists() {
  return pool.query(`
    CREATE TABLE IF NOT EXISTS  ${process.env.DB_SCHEMA || "public"}.${process.env.DB_TABLE || "stripe_events"} (
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

/**
 * Inserts an event automatically incrementing the version number as needed
 */
export async function InsertEvent() {

}
