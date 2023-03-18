import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import bunyan from 'bunyan'
import { v4 as uuidv4 } from 'uuid'
import cors from 'cors'
import { serve } from "inngest/express"

import { inngest, inngestFuncs } from "./inngest"
import { logger } from './logger'
import { ConnectDB } from './db'
import { ListObject, stripe } from './stripe'

const listenPort = process.env.PORT || '8080'

declare global {
  namespace Express {
    interface Request {
      id: string
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      DSN: string
      PORT: string
      DB_SCHEMA?: string
      DB_TABLE?: string
      INNGEST_EVENT_KEY: string
      INNGEST_SIGNING_KEY: string
      ENABLE_INNGEST?: string
      STRIPE_KEY?: string
      STRIPE_WEBHOOK_SECRET?: string
    }
  }
}

async function main() {

  const app = express()
  app.disable('x-powered-by')
  app.use(cors())

  const log = bunyan.createLogger({
    name: "tsapitemplate",
    serializers: bunyan.stdSerializers,
    level: 'debug'
  })

  if (process.env.ENABLE_INNGEST === "true") {
    app.use("/inngest", express.json(), serve(inngest, inngestFuncs))
  }

  // Connect DB
  try {
    await ConnectDB()
  } catch (error: any) {
    log.error({ m: "failed to connect to db", err: error })
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
      req.log = log.child({ req_id: req.id }, true)
      req.log.info({ req })
      res.on("finish", () => req.log.info({ res }))
      next()
    })
  }

  app.get('/hc', (req, res) => {
    res.sendStatus(200)
  })

  app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
    let event = request.body
    if (stripe && process.env.STRIPE_WEBHOOK_SECRET) {
      // Get the signature sent by Stripe
      const signature = request.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature!,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        logger.warn({
          err
        }, "webhook signature verification failed")
        return response.sendStatus(400);
      }
    }
  })

  app.post('/list/:objectType', express.json(), async (req, res) => {
    return res.json(await ListObject(req.params.objectType as any))
  })

  const server = app.listen(listenPort, () => {
    logger.info(`API listening on port ${listenPort}`)
  })

  let stopping = false

  process.on('SIGTERM', async () => {
    if (!stopping) {
      stopping = true
      logger.warn('Received SIGTERM command, shutting down...')
      server.close()
      logger.info('exiting...')
      process.exit(0)
    }
  })

  process.on('SIGINT', async () => {
    if (!stopping) {
      stopping = true
      logger.warn('Received SIGINT command, shutting down...')
      server.close()
      logger.info('exiting...')
      process.exit(0)
    }
  })
}

main()
