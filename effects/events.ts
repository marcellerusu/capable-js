import * as capable from "../index.js";

class Event {
  type: string;
  elem: HTMLElement;
  constructor(type: string, elem: HTMLElement) {
    this.type = type;
    this.elem = elem;
  }
}

capable.runtime.register(
  Event,
  (_component, { type, elem }) =>
    new Promise((resolve) => elem.addEventListener(type, resolve))
);

type EventHandler = Record<string, (elem: HTMLElement | Window) => Event>;

export let on = new Proxy<EventHandler>(
  {},
  {
    get(_target, event_name, _receiver): (elem: HTMLElement) => Event {
      return (elem) => new Event(event_name as string, elem);
    },
  }
);
