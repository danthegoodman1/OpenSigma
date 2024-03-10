// Anything other than .exec crashes vitest

import { DuckDBProvider } from "./index.js"

const str = new DuckDBProvider()
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
const res = await str.db.all("select * from stripe_events", (err, rows) => {
  console.log(rows)
})
