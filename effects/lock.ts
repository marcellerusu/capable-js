import { register } from "../framework.js";

class Lock {
  locked = true;
  #listeners = [];

  async *[Symbol.asyncIterator]() {
    yield this.locked;
    while (this.locked) {
      yield await this.tick();
    }
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

  unlock() {
    this.locked = false;
    this.#listeners = this.#listeners.filter((fn) => !fn());
  }
}

register<Lock>(Lock, (_component, lock) => {
  return lock;
});

export default {
  new() {
    return new Lock();
  },
};
