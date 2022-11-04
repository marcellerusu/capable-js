import { on } from "../../effects/events.js";
import { clear, resize, square } from "./canvas.js";
import * as capable from "../../index.js";
import signal, { Signal } from "../../effects/signal.js";
import { Variant } from "../../utils/Variant.js";

class Go<T> {
  component: AsyncGeneratorFunction;
  constructor(component: AsyncGeneratorFunction) {
    this.component = component;
  }
  [capable.runtime.EffectEquals](other: Go<T>) {
    return this.component === other.component;
  }
}

function go(component) {
  return new Go(component);
}

capable.runtime.register(Go, (component, go) => {
  let channel = signal.of(null);
  let sub_component = capable.runtime.mount(async function* (props) {
    yield* go.component({ ...props, channel });
  }, component.mount);
  capable.runtime.run(sub_component);
  return (message) => (channel.value = message);
});

let SPEED = 5;

type BallMsg = {
  Left: {};
  Right: {};
  Up: {};
  Down: {};
};

let Left = new Variant<BallMsg>("Left", {});
let Right = new Variant<BallMsg>("Right", {});
let Up = new Variant<BallMsg>("Up", {});
let Down = new Variant<BallMsg>("Down", {});

type BallProps = {
  channel: Signal<Variant<BallMsg>>;
};

async function* Ball({ channel }: BallProps) {
  let [x, y] = [10, 10];

  for await (let msg of channel) {
    msg?.match({
      Left: () => (x -= SPEED),
      Right: () => (x += SPEED),
      Up: () => (y -= SPEED),
      Down: () => (y += SPEED),
    });
    yield clear();
    yield square(x, y, 100);
  }
}

async function* Game() {
  yield resize(500, 500);
  let send = yield go(Ball);
  while (true) {
    let { key } = yield on.keydown(window);
    if (key === "ArrowLeft") send(Left);
    else if (key === "ArrowRight") send(Right);
    else if (key === "ArrowUp") send(Up);
    else if (key === "ArrowDown") send(Down);
  }
}

export default Game;
