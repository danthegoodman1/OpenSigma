import { StripeTypes } from "../stripe/types"
import { ClickHouseProvider } from "./providers/clickhouse";
import { TinybirdProvider } from "./providers/tinybird";

export interface Event {
  data: { id: string; [key: string]: any }
  type: StripeTypes
  timeSec: Number
}

export interface Storage {
  Init(): Promise<void>
  InsertEvents(events: Event[]): Promise<void>
}

export let strg: Storage

export async function SetupStorage() {
  switch (process.env.STORAGE) {
    case "clickhouse":
      strg = new ClickHouseProvider()
      break
    case "tinybird":
      strg = new TinybirdProvider()
      break
  
    default:
      throw new Error(`unknown storage provider '${process.env.STORAGE}', set the STORAGE env var to a supported storage engine (see src/storage/index.ts)`)
  }
  await strg.Init()
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
