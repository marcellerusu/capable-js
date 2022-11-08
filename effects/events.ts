import * as capable from "../index.js";

export class EventEff {
  type: string;
  elem: EventTarget;
  constructor(type: string, elem: EventTarget) {
    this.type = type;
    this.elem = elem;
  }
}

capable.runtime.register(
  EventEff,
  (_component, { type, elem }) =>
    new Promise((resolve) => elem.addEventListener(type, resolve))
);

type EventHandler = Record<string, (elem?: EventTarget) => EventEff>;

export let on = new Proxy<EventHandler>(
  {},
  {
    get(_target, event_name, _receiver): (elem?: EventTarget) => EventEff {
      return (elem = window) => new EventEff(event_name as string, elem);
    },
  }
);
