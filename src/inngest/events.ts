import { StripeTypes } from "../stripe/types"

export type InngestEvents = {
  "stripe/backfill": BackfillEvent
}

export interface BackfillEvent {
  name: "stripe/backfill"
  data: {
    object_types: StripeTypes[]
    /**
     * Will only backfill events greater than or equal to this time. In second since epoch.
     */
    gte?: number
    /**
     * Page size when listing from Stripe. Default `100`.
     */
    page_size?: number
    /**
     * Best-effort rate limit for the number of calls to Stripe per second. Default `5`.
     */
    rate_limit?: number
  }
}
