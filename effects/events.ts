import * as capable from "../index.js";

class Event {
  type: string;
  elem: EventTarget;
  constructor(type: string, elem: EventTarget) {
    this.type = type;
    this.elem = elem;
  }
}

capable.runtime.register(
  Event,
  (_component, { type, elem }) =>
    new Promise((resolve) => elem.addEventListener(type, resolve))
);

type EventHandler = Record<string, (elem?: EventTarget) => Event>;

export let on = new Proxy<EventHandler>(
  {},
  {
    get(_target, event_name, _receiver): (elem?: EventTarget) => Event {
      return (elem = window) => new Event(event_name as string, elem);
    },
  }
);
