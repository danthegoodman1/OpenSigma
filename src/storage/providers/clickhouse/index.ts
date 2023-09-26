import { ClickHouseClient, createClient } from "@clickhouse/client"
import { Event, Storage } from "../.."

export class ClickHouseProvider implements Storage {
  client: ClickHouseClient
  chTable: string
  constructor() {
    this.client = createClient({
      username: process.env.CH_USER || "default",
      password: process.env.CH_PASSWORD,
      host: process.env.CH_HOST,
      database: process.env.CH_DATABASE || 'default'
    })
    if (!process.env.CH_TABLE) {
      throw new Error("missing CH_TABLE env var")
    }
    this.chTable = process.env.CH_TABLE
  }

  async Init() {
    const res = await this.client.ping()
    if (!res.success) {
      throw new Error("failed to ping clickhouse")
    }

    // TODO: Create tables
  }

  async InsertEvents(events: Event[]) {
    await this.client.insert({
      table: this.chTable,
      values: events.map((event) => {
        return {
          ...event,
          id: event.data.id,
          data: JSON.stringify(event.data),
        }
      }),
      format: "JSONEachRow",
    })
  }
}
