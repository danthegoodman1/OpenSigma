import { Event, HighStatusCode, Storage } from "../.."
import { logger } from "../../../logger"

export class TinybirdProvider implements Storage {
  tbURL: string
  tbAuth: string
  tbRawTable: string

  constructor() {
    this.tbURL = process.env.TB_URL || "https://api.us-east.tinybird.co"
    if (!process.env.TB_AUTH || !process.env.TB_RAW_TABLE) {
      throw new Error("missing tb auth or raw table env vars")
    }
    this.tbAuth = process.env.TB_AUTH
    this.tbRawTable = process.env.TB_RAW_TABLE
  }

  async Init() {
    // Nothing to do
  }

  async InsertEvents(events: Event[]) {
    const start = new Date().getTime()
    const response = await fetch(
      `${this.tbURL}/v0/events?name=${encodeURIComponent(
        new URL(this.tbRawTable).searchParams.get("name") as string
      )}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.tbAuth}`,
        },
        body: events.map((event) => JSON.stringify(event)).join("\n"),
      }
    )
    if (response.status > 299) {
      throw new HighStatusCode(response.status, await response.text())
    }
    logger.debug("inserted events into tinybird in", new Date().getTime() - start)
  }
}
