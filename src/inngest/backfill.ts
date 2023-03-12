import { logger as log } from "../logger"

import { inngest } from ".";
import { randomUUID } from "crypto";

export const backfillWorkflow = inngest.createFunction("Backfill Workflow", {
  event: "stripe/backfill"
}, async ({ event, step }) => {

  const runID = step.run("Generate run ID", () => {
    return randomUUID()
  })

  const logger = log.child({
    event: event.name,
    runID
  })
})
