import * as capable from "../index.js";

class StartInterval {
  delay: number;
  fn: Function;
  constructor(fn: Function, delay: number) {
    this.fn = fn;
    this.delay = delay;
  }
}

class StopInterval {
  id: number;
  constructor(id: number) {
    this.id = id;
  }
}

capable.runtime.register(StartInterval, (_component, { delay, fn }) => {
  return setInterval(fn, delay);
});

capable.runtime.register(StopInterval, (_component, { id }) => {
  clearInterval(id);
});

export default {
  each_second(fn: Function) {
    return new StartInterval(fn, 1000);
  },
  stop(id: number) {
    return new StopInterval(id);
  },
};
