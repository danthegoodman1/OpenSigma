import { Inngest } from "inngest"
import { InngestEvents } from "./events"

export let inngest: Inngest<InngestEvents>
if (process.env.ENABLE_INNGEST === "true") {
  inngest = new Inngest<InngestEvents>({ name: "OpenSigma" })
}

import { backfillWorkflow } from "./backfill"

export const inngestFuncs = [backfillWorkflow]
