import * as capable from "../index.js";

export class StartInterval {
  delay: number;
  fn: Function;
  constructor(fn: Function, delay: number) {
    this.fn = fn;
    this.delay = delay;
  }

  [capable.runtime.EffectEquals](other: StartInterval) {
    return this.delay === other.delay;
  }
}

export class StopInterval {
  id: number;
  constructor(id: number) {
    this.id = id;
  }

  [capable.runtime.EffectEquals](other: StopInterval) {
    return this.id === other.id;
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
  each_frame(fn: Function) {
    return new StartInterval(fn, 1000 / 60);
  },
  stop(id: number) {
    return new StopInterval(id);
  },
};
