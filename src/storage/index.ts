import { StripeTypes } from "../stripe/types"

export interface Event {
  data: { id: string; [key: string]: any }
  type: StripeTypes
  timeSec: Number
}

export interface Storage {
  Init(): Promise<void>
  InsertEvents(events: Event[]): Promise<void>
}

export let strg: Storage

export async function SetupStorage() {}

export class HighStatusCode extends Error {
  code: number
  resText: string
  constructor(code: number, resText: string) {
    super(`high status code ${code} - ${resText}`)
    this.code = code
    this.resText = resText

    // capturing the stack trace keeps the reference to your error class
    Error.captureStackTrace(this, this.constructor)
  }
}
