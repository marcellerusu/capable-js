import { Component, register } from "./framework.js";

export class Signal {
  #value;
  #listeners = [];
  constructor(value) {
    this.#value = value;
  }

  has_signal() {
    return false;
  }

  on_change(fn) {
    this.#listeners.push(fn);
  }

  set value(new_value) {
    this.#value = new_value;
    this.#listeners.forEach((fn) => fn());
  }
  get value() {
    return this.#value;
  }
}

register(Signal, (component: Component, sig) => {
  sig.on_change(() => component.restart());
  return sig;
});
