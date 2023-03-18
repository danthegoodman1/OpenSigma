import { logger as log } from "../logger"

import { inngest } from ".";
import { randomUUID } from "crypto";
import { ListObject } from "../stripe";
import { InsertEvents } from "../db";

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

  // Will use a step for every object type. Safe to rerun because of idempotentcy of the insert
  for (const objectType of event.data.object_types) {
    // Will run sequentially to prevent rate limiting issues
    await step.run("Backfill stripe event", async () => {
      logger.debug(`starting backfill for ${objectType}`)
      let hasMore: boolean
      let startingAfter: string | undefined
      do {
        const res = await ListObject(objectType, {
          limit: 100,
          starting_after: startingAfter
        })
        await InsertEvents(res.data.map((obj) => {
          return {
            data: obj,
            type: objectType
          }
        }), {
          insertOnConflict: false
        })
        logger.debug(`inserted ${res.data.length} of '${objectType}'`)
        hasMore = res.has_more
        if (hasMore && event.data.gte) {
          // Check if we are still gte
          hasMore = !res.data.some((obj) => obj.created && typeof obj.created === "number" && obj.created < event.data.gte!)
          if (!hasMore) {
            logger.info(`Hit gte limiter for ${objectType}, breaking`)
          }
        }
      } while (hasMore)
      logger.debug(`Reached the end for ${objectType}`)
    })
  }
})
