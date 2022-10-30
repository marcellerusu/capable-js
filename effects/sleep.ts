import * as capable from "../index.js";

export class Sleep {
  ms: number;
  constructor(ms: number) {
    this.ms = ms;
  }
}

let sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

capable.runtime.register(Sleep, (_component, { ms }) => sleep(ms));

export default {
  of(ms: number) {
    return new Sleep(ms);
  },
};
