import { on } from "../../effects/events.js";
import { circle, clear, resize } from "./canvas/index.js";
import * as capable from "../../index.js";
import { Signal } from "../../effects/signal.js";
import { Variant } from "../../utils/Variant.js";
import interval from "../../effects/interval.js";

class Spawn<T> {
  component: (...args: any) => AsyncGenerator;
  constructor(component: (...args: any) => AsyncGenerator) {
    this.component = component;
  }
  [capable.runtime.EffectEquals](other: Spawn<T>) {
    return this.component === other.component;
  }
}

class Channel<T> {
  #listener_queue: Function[] = [];
  msgs: T[] = [];
  send(msg: T): Promise<T> {
    this.msgs.push(msg);
    this.#listener_queue.forEach((fn) => fn(msg));
    this.#listener_queue = [];
    return this.tick();
  }
  async *[Symbol.asyncIterator](): AsyncGenerator<T, any, unknown> {
    for (let msg of this.msgs) {
      yield msg;
    }
    while (true) {
      yield await this.receive();
    }
  }
  receive(): Promise<T> {
    let msg = this.msgs.pop();
    if (msg) return Promise.resolve(msg);
    return this.tick();
  }
  tick(): Promise<T> {
    return new Promise((resolve) => this.#listener_queue.push(resolve));
  }
}

function spawn(component: (...args: any) => AsyncGenerator) {
  return new Spawn(component);
}

capable.runtime.register(Spawn, (component, go) => {
  let $channel = new Channel();
  async function* process() {
    yield* go.component($channel);
  }
  let sub_component = capable.runtime.mount(process, component.mount);
  capable.runtime.run(sub_component);
  return $channel;
});

type BallMsg = {
  Left: {};
  Right: {};
  Up: {};
  Down: {};
  Tick: {};
};

const Left = new Variant<BallMsg>("Left", {});
const Right = new Variant<BallMsg>("Right", {});
const Up = new Variant<BallMsg>("Up", {});
const Down = new Variant<BallMsg>("Down", {});
const Tick = new Variant<BallMsg>("Tick", {});

const ACCELERATION = 0.1;

async function* Ball($channel: Channel<Variant<BallMsg>>) {
  let vx = 0;
  let vy = 0;
  let [x, y] = [10, 10];

  for await (let msg of $channel) {
    console.log("here", msg);
    msg?.match({
      Left: () => (vx -= ACCELERATION),
      Right: () => (vx += ACCELERATION),
      Up: () => (vy -= ACCELERATION),
      Down: () => (vy += ACCELERATION),
      Tick() {
        x += vx;
        y += vy;
      },
    });
    yield clear();
    yield circle(x, y, 1);
  }
}

type ChildMsg = {
  Ping: {};
  Pong: {};
};

let Ping = new Variant<ChildMsg>("Ping", {});
let Pong = new Variant<ChildMsg>("Pong", {});

async function* Child($channel: Channel<Variant<ChildMsg>>) {
  for await (let msg of $channel) {
    msg?.match({
      Ping() {
        $channel.send(Pong);
      },
    });
  }
}

async function* Game() {
  let child: Channel<Variant<ChildMsg>> = yield spawn(Child);
  let c = await child.send(Ping);

  let response = await child.receive();

  console.log(c, response);
}

// async function* Game() {
//   yield resize(500, 500);
//   let ball: Channel<Variant<BallMsg>> = yield spawn(Ball);
//   yield interval.each_frame(() => ball.send(Tick));
//   while (true) {
//     let { key } = yield on.keydown(window);
//     if (key === "ArrowLeft") ball.send(Left);
//     else if (key === "ArrowRight") ball.send(Right);
//     else if (key === "ArrowUp") ball.send(Up);
//     else if (key === "ArrowDown") ball.send(Down);
//   }
// }

export default Game;
