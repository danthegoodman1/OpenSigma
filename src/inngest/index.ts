import { Inngest } from "inngest";
import { backfillWorkflow } from "./backfill";
import { InngestEvents } from "./events";

export let inngest: Inngest<InngestEvents>
if (process.env.ENABLE_INNGEST === "true") {
  inngest = new Inngest<InngestEvents>({ name: "OpenSigma" })
}

export const inngestFuncs = [backfillWorkflow]
