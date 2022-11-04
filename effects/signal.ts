import * as capable from "../index.js";

export class Signal<T> {
  #value: T;
  #listeners = [];
  constructor(value: T) {
    this.#value = value;
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T, any, unknown> {
    yield this.#value;
    while (true) {
      yield await this.tick();
    }
  }

  async tick(): Promise<T> {
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

  [capable.runtime.EffectEquals](other: Signal<T>) {
    return capable.deep_eq(this.value, other.value);
  }
}

capable.runtime.register(Signal, (_component, sig) => sig);

export default {
  of<T>(value: T) {
    return new Signal(value);
  },
};
