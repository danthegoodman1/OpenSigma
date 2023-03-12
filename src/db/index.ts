import { Pool } from 'pg'

export let pool: Pool

export async function ConnectDB() {
  pool = new Pool({
    connectionString: process.env.DSN,
    connectionTimeoutMillis: 5000
  })
}
