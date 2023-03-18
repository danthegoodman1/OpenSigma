import fetch from "cross-fetch"
import Stripe from "stripe"

import { logger } from "../logger";
import { StripeTypes } from "./types";

export let stripe: Stripe | undefined
if (process.env.STRIPE_KEY) {
  stripe = new Stripe(process.env.STRIPE_KEY, {
    apiVersion: "2022-11-15"
  })
}

export interface ListOptions {
  starting_after?: string
  limit?: number
}

export interface StripeObjectList {
  url: string
  has_more: boolean,
  object: "list",
  data: any[]
}

export async function ListObject(type: StripeTypes, opts?: ListOptions): Promise<StripeObjectList> {
  try {
    console.log("listing object")
    const payload = new URLSearchParams({
      "limit": String(opts?.limit || 30),
    })

    if (opts?.starting_after) {
      payload.set("starting_after", opts.starting_after)
    }

    const res = await fetch(`https://api.stripe.com/v1/${type}?${payload}`, {
      headers: {
        "Authorization": `Basic ${Buffer.from(process.env.STRIPE_KEY + ":").toString("base64")}`,
        // "Content-Type": "application/x-www-form-urlencoded"
      }
    })

    if (res.status > 299) {
      throw new Error(`high status code ${res.status}: ${await res.text()}`)
    }
    return await res.json()
  } catch (error) {
    logger.error({
      error
    }, "error making stripe request")
    throw error
  }
}
