import * as capable from "../index.js";

export class Lock {
  locked = true;
  #listeners = [];

  async *[Symbol.asyncIterator](): AsyncIterator<any> {
    yield this.locked;
    while (this.locked) {
      yield await this.tick();
    }
  }

  [capable.runtime.EffectEquals](other: Lock) {
    return this.locked === other.locked;
  }

  async tick() {
    return new Promise((resolve) =>
      this.#on_change(() => {
        resolve(this.locked);
        return true;
      })
    );
  }

  #on_change(fn) {
    this.#listeners.push(fn);
  }

  release() {
    this.locked = false;
    this.#listeners = this.#listeners.filter((fn) => !fn());
  }
}

capable.runtime.register(Lock, (_component, lock) => lock);

export default {
  new() {
    return new Lock();
  },
};
