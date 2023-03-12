import pino from 'pino'

export const logMsgKey = "msg"

export const logger = pino(process.env.DEBUG === "1" ? {
  transport: {
    target: 'pino-pretty',
  },
  level: process.env.LOG_LEVEL || 'debug',

} : {
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return {
        [process.env.LOG_LEVEL_KEY || 'level']: label
      }
    }
  }
})
