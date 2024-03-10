import { Pool } from 'pg'
import pg from 'pg'

import { Event, Storage } from "../../index.js"

export let pool: Pool

export class PostgresProvider implements Storage {
  pool: Pool

  constructor() {
    this.pool = new pg.Pool({
      connectionString: process.env.DSN,
      connectionTimeoutMillis: 5000
    })
  }

  async Init() {
    // Make sure a connection works
    await this.pool.query("select 1")
  }

  async InsertEvents(events: Event[]) {
    const valuesParts = []
    for (let i = 0; i < events.length; i+=4) {
      valuesParts.push(`($${i+1}, $${i+2}, $${i+3}, $${i+4})`)
    }
    await this.pool.query(`
      insert into ${process.env.PG_TABLE || "stripe_events"} (
        object_type
        , id
        , time_sec
        , data
      ) values ${valuesParts.join(", ")}
    `, [events])
  }
}
