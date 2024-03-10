import { ListObject } from "./index.js"
import { logger } from "../logger/index.js"
import { strg } from "../storage/index.js"
import { StripeTypes } from "./types.js"

export async function backfillObjectType(objectType: StripeTypes, gte?: string) {
  logger.debug(`starting backfill for ${objectType}`)
  let hasMore: boolean
  let startingAfter: string | undefined
  do {
    const res = await ListObject(objectType, {
      limit: 100,
      starting_after: startingAfter,
    })
    await strg.InsertEvents(
      res.data.map((obj) => {
        return {
          data: obj,
          object_type: obj.object,
          time_sec: obj.created || Math.floor(new Date().getTime() / 1000),
          event_type: "_backfill"
        }
      })
    )
    logger.debug(`inserted ${res.data.length} of '${objectType}' last id ${res.data[res.data.length-1].id}`)
    hasMore = res.has_more
    if (hasMore && gte) {
      // Check if we are still gte
      hasMore = !res.data.some(
        (obj) =>
          obj.created &&
          typeof obj.created === "number" &&
          obj.created < gte!
      )
      if (!hasMore) {
        logger.info(`Hit gte limiter for ${objectType}, breaking`)
      }
    }
    startingAfter = res.data[res.data.length-1].id
  } while (hasMore)
  logger.debug(`Reached the end for ${objectType}`)
}
