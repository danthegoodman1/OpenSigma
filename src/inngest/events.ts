export type InngestEvents = {
  "slack/thread.created": NewThreadEvent
  "slack/thread.message": ThreadMessageEvent
  "slack/channel.joined": ChannelJoinedEvent
}

export interface NewThreadEvent {
  name: "slack/thread.created"
  data: {
    namespace: string
    channelID: string
    threadTS: string
    skipTimeout?: boolean
  }
}

export interface ThreadMessageEvent {
  name: "slack/thread.message"
  data: {
    namespace: string
    channelID: string
    threadTS: string
    messageTS: String
  }
}

export interface ChannelJoinedEvent {
  name: "slack/channel.joined"
  data: {
    channelID: string
    namespace: string
    inviter?: string
  }
}
