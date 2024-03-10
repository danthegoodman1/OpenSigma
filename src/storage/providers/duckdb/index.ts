import { readFile } from "fs/promises"
import path from "path"
import { logger } from "../../../logger/index.js"

import { Event, Storage } from "../../index.js"
import duckdb from "duckdb"

const dbFileName = process.env.DB_FILENAME ?? "duck.db"

export class DuckDBProvider implements Storage {
  db: duckdb.Database

  constructor() {
    this.db = new duckdb.Database(dbFileName)
  }

  async Init() {
    logger.debug(`Using db file "${dbFileName}"`)
    const schema = `create table if not exists stripe_events (
      object_type text not null,
      id text not null,
      time_sec int8 not null,
      data json not null,

      primary key(time_sec, id) -- only to enforce single row, not for performance
    );`
    logger.debug(`Running schema.sql`)
    schema
      .split(";")
      .filter((stmt) => stmt.trim() !== "")
      .map((stmt) => {
        this.db?.run(stmt.trim())
      })
    logger.debug("Loaded schema")

    // Load extensions
    const extensions = ["json"]
    // If there are custom ones to add, add them
    if (process.env.DUCKDB_EXTENSIONS) {
      extensions.push(
        ...process.env.DUCKDB_EXTENSIONS.split(",").map((i) => i.trim())
      )
    }
    for (const ext of extensions) {
      logger.debug(`installing ${ext} extension`)
      this.db?.run(`install ${ext}`)
      logger.debug(`loading ${ext} extension`)
      this.db?.run(`load ${ext}`)
    }
  }

  async InsertEvents(events: Event[]) {
    const valuesParts = []
    for (let i = 0; i < events.length; i += 4) {
      valuesParts.push(`(?, ?, ?, ?)`)
    }
    await this.db!.exec(
      `
      insert into ${process.env.PG_TABLE || "stripe_events"} (
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
        .flat(1),
      () => {}
    )
  }
}
