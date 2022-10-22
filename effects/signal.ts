import { Component, register } from "../framework.js";

class Signal<T> {
  #value;
  #listeners = [];
  constructor(value: T) {
    this.#value = value;
  }

  [Symbol.asyncIterator]() {
    let self = this;
    return {
      first: true,
      async next() {
        if (this.first) {
          this.first = false;
          return {
            done: false,
            value: self.#value,
          };
        } else {
          console.log("next");
          return {
            done: false,
            value: await self.tick(),
          };
        }
      },
    };
  }

  async tick() {
    return new Promise((resolve) =>
      this.on_change(() => {
        console.log("here");
        resolve(this.#value);
        return true;
      })
    );
  }

  on_change(fn) {
    this.#listeners.push(fn);
  }

  set value(new_value) {
    this.#value = new_value;
    this.#listeners = this.#listeners.filter((fn) => !fn());
  }
  get value() {
    return this.#value;
  }
}

register(Signal, (component: Component, sig) => {
  return sig;
});

export default {
  of<T>(value: T) {
    return new Signal(value);
  },
};
