import { test } from "vitest"
import { backfillObjectType } from "./backfill.js"
import { SqliteProvider } from "../storage/providers/sqlite/index.js"

test(
  "backfill",
  async () => {
    const str = new SqliteProvider()
    await str.Init()
    await backfillObjectType("payment_intents", str)
  },
  {
    timeout: 300_000,
  }
)
