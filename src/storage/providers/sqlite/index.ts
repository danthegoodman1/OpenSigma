import sqlite from "sqlite3"
import { Database, open } from "sqlite"

import { readFile } from "fs/promises"
import path from "path"
import { logger } from "../../../logger/index.js"

import { Event, Storage } from "../../index.js"

export class SqliteProvider implements Storage {
  db?: Database

  constructor() {}

  async Init() {
    const dbFileName = process.env.DB_FILENAME ?? "sqlite.db"
    this.db = await open({
      filename: dbFileName,
      driver: sqlite.Database,
    })

    await this.db.exec("PRAGMA journal_mode = WAL;")
    await this.db.exec("PRAGMA busy_timeout = 5000;")
    await this.db.exec("PRAGMA synchronous = NORMAL;")
    logger.debug(`Using db file "${dbFileName}"`)
    const schema = `create table if not exists stripe_events (
      object_type text not null,
      id text not null,
      time_sec int8 not null,
      data json not null,

      primary key(time_sec, id)
    );`
    logger.debug(`Running schema.sql`)
    schema
      .split(";")
      .filter((stmt) => stmt.trim() !== "")
      .map((stmt) => {
        this.db!.exec(stmt.trim())
      })
    logger.debug("Loaded schema")
  }

  async InsertEvents(events: Event[]) {
    const valuesParts = []
    for (let i = 0; i < events.length * 4; i += 4) {
      valuesParts.push(`($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4})`)
    }
    await this.db!.run(
      `
      insert or replace into ${process.env.PG_TABLE || "stripe_events"} (
        object_type
        , id
        , time_sec
        , data
      ) values ${valuesParts.join(", ")}
    `,
      ...events
        .map((e) => [
          e.object_type,
          e.data.id,
          e.time_sec,
          JSON.stringify(e.data),
        ])
        .flat(1)
    )
  }
}
