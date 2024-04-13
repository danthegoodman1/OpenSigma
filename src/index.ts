import * as dotenv from "dotenv"
dotenv.config()

import express, { Request } from "express"
import { v4 as uuidv4 } from "uuid"
import cors from "cors"

import { logger } from "./logger/index.js"
import { ListObject, stripe } from "./stripe/index.js"
import { SetupStorage, strg } from "./storage/index.js"
import { backfillObjectType } from "./stripe/backfill.js"
import { StripeTypes } from "./stripe/types.js"
import Stripe from "stripe"

const listenPort = process.env.PORT || "8080"

declare global {
  namespace Express {
    interface Request {
      id: string
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      STRIPE_KEY?: string
      STRIPE_WEBHOOK_SECRET?: string
      KEY: string
      STORAGE: string
    }
  }
}

async function main() {
  const app = express()
  app.disable("x-powered-by")
  app.use(cors())

  // Connect DB
  try {
    await SetupStorage()
  } catch (error: any) {
    logger.error(
      {
        err: error,
      },
      "failed to setup storage"
    )
    process.exit(1)
  }

  app.use((req, res, next) => {
    const reqID = uuidv4()
    req.id = reqID
    next()
  })

  if (process.env.HTTP_LOG === "1") {
    logger.debug("using HTTP logger")
    app.use((req: any, res, next) => {
      logger.debug({ req }, "handling request")
      res.on("finish", () => logger.debug({ req, res }, "request complete"))
      next()
    })
  }

  app.get("/hc", (req, res) => {
    res.sendStatus(200)
  })

  app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      if (stripe && process.env.STRIPE_WEBHOOK_SECRET) {
        // Get the signature sent by Stripe
        const signature = req.headers["stripe-signature"]
        try {
          const event = stripe.webhooks.constructEvent(
            req.body,
            signature!,
            process.env.STRIPE_WEBHOOK_SECRET
          )
          await strg.InsertEvents([
            {
              data: event.data.object,
              object_type: event.object as StripeTypes,
              time_sec:
                event.created || Math.floor(new Date().getTime() / 1000),
              event_type: event.type,
            },
          ])
        } catch (err) {
          logger.warn(
            {
              err,
            },
            "webhook signature verification failed"
          )
          return res.sendStatus(400)
        }
      }
    }
  )

  app.post(
    "/direct",
    express.json(),
    async (req: Request<{}, {}, Stripe.Event>, res) => {
      if (req.headers.authorization !== process.env.KEY) {
        return res.status(403).send("invalid auth")
      }
      await strg.InsertEvents([
        {
          data: req.body.data.object,
          object_type: req.body.object as StripeTypes,
          time_sec: req.body.created || Math.floor(new Date().getTime() / 1000),
          event_type: req.body.type,
        },
      ])
    }
  )

  app.post(
    "/list",
    express.json(),
    async (req: Request<{}, {}, { objectType: StripeTypes }>, res) => {
      return res.json(await ListObject(req.body.objectType))
    }
  )

  app.post(
    "/backfill",
    express.json(),
    async (req: Request<{}, {}, { objectType: StripeTypes }>, res) => {
      if (req.headers.authorization !== process.env.KEY) {
        return res.status(403).send("invalid auth")
      }
      await backfillObjectType(req.body.objectType, strg)
      return res.send("done")
    }
  )

  const server = app.listen(listenPort, () => {
    logger.info(`API listening on port ${listenPort}`)
  })

  let stopping = false

  process.on("SIGTERM", async () => {
    if (!stopping) {
      stopping = true
      logger.warn("Received SIGTERM command, shutting down...")
      server.close()
      logger.info("exiting...")
      process.exit(0)
    }
  })

  process.on("SIGINT", async () => {
    if (!stopping) {
      stopping = true
      logger.warn("Received SIGINT command, shutting down...")
      server.close()
      logger.info("exiting...")
      process.exit(0)
    }
  })
}

main()
