import { Inngest } from "inngest";
import { InngestEvents } from "./events";

export const inngest = new Inngest<InngestEvents>({ name: "OpenSigma" })

export const inngestFuncs = []
