import { ListObject } from "."
import { InsertEvents } from "../db"
import { logger } from "../logger"
import { StripeTypes } from "./types"

export async function backfillObjectType(objectType: StripeTypes, gte?: string) {
  logger.debug(`starting backfill for ${objectType}`)
  let hasMore: boolean
  let startingAfter: string | undefined
  do {
    const res = await ListObject(objectType, {
      limit: 100,
      starting_after: startingAfter,
    })
    await InsertEvents(
      res.data.map((obj) => {
        return {
          data: obj,
          type: objectType,
        }
      }),
      {
        insertOnConflict: false,
      }
    )
    logger.debug(`inserted ${res.data.length} of '${objectType}'`)
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
  } while (hasMore)
  logger.debug(`Reached the end for ${objectType}`)
}
