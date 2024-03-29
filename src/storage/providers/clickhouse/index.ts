import { ClickHouseClient, createClient } from "@clickhouse/client"
import { Event, Storage } from "../../index.js"

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
    await this.client.query({
      query: "select 1 from " + this.chTable
    })
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
      clickhouse_settings: {
        async_insert: process.env.CH_ASYNC_INSERT === "1" ? 1 : 0
      }
    })
  }
}
