import { Event, Storage } from "../../index.js"

export class MemoryProvider implements Storage {
  data: { [key: string]: any }

  constructor() {
    this.data = {}
  }

  async Init() {}

  async InsertEvents(events: Event[]) {
    for (const event of events) {
      this.data[event.data.id] = event
    }
  }
}
