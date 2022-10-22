import { Component, register } from "../framework.js";

class Signal<T> {
  #value: T;
  #listeners = [];
  constructor(value: T) {
    this.#value = value;
  }

  async *[Symbol.asyncIterator]() {
    yield this.#value;
    while (true) {
      yield await this.tick();
    }
  }

  async tick() {
    return new Promise((resolve) =>
      this.#on_change(() => {
        resolve(this.#value);
        return true;
      })
    );
  }

  #on_change(fn) {
    this.#listeners.push(fn);
  }

  set value(new_value) {
    this.#value = new_value;
    // TODO: we don't rely on on_change anywhere else.. couldn't
    // we just completely flush all the listeners?
    this.#listeners = this.#listeners.filter((fn) => !fn());
  }
  get value() {
    return this.#value;
  }
}

register(Signal, (_component: Component, sig) => {
  return sig;
});

export default {
  of<T>(value: T) {
    return new Signal(value);
  },
};
