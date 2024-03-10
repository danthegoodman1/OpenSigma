import { test } from "vitest"
import { SqliteProvider } from "./index.js"

test("sqlite", async () => {
  const str = new SqliteProvider()
  await str.Init()
  await str.InsertEvents([
    {
      data: {
        id: "testid",
        hey: "ho",
      },
      event_type: "test",
      object_type: "accounts",
      time_sec: new Date().getTime() / 1000,
    },
  ])

  const res = await str.db?.get("select * from stripe_events")
  console.log(res)
})
