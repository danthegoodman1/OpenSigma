import { logger } from "../logger/index.js"
import { StripeTypes } from "../stripe/types.js"
import { ClickHouseProvider } from "./providers/clickhouse/index.js"
import { DuckDBProvider } from "./providers/duckdb/index.js"
import { MemoryProvider } from "./providers/memory/index.js"
import { PostgresProvider } from "./providers/postgres/index.js"
import { SqliteProvider } from "./providers/sqlite/index.js"
import { TinybirdProvider } from "./providers/tinybird/index.js"

export interface Event {
  data: {
    // id: string
    [key: string]: any
  }
  object_type: StripeTypes
  time_sec: Number
  event_type: string
}

export interface Storage {
  Init(): Promise<void>
  InsertEvents(events: Event[]): Promise<void>
}

export let strg: Storage

export async function SetupStorage() {
  switch (process.env.STORAGE) {
    case "memory":
      strg = new MemoryProvider()
      break
    case "clickhouse":
      strg = new ClickHouseProvider()
      break
    case "tinybird":
      strg = new TinybirdProvider()
      break
    case "postgres":
      strg = new PostgresProvider()
      break
    case "postgres":
      strg = new PostgresProvider()
      break
    case "sqlite":
      strg = new SqliteProvider()
      break
    case "duckdb":
      strg = new DuckDBProvider()
      break

    default:
      throw new Error(
        `unknown storage provider '${process.env.STORAGE}', set the STORAGE env var to a supported storage engine (see src/storage/index.ts)`
      )
  }
  try {
    await strg.Init()
  } catch (error) {
    logger.error("failed to init storage")
    throw error
  }
}

export class HighStatusCode extends Error {
  code: number
  resText: string
  constructor(code: number, resText: string) {
    super(`high status code ${code} - ${resText}`)
    this.code = code
    this.resText = resText

    // capturing the stack trace keeps the reference to your error class
    Error.captureStackTrace(this, this.constructor)
  }
}
