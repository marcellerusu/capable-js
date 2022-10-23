import { make, register, start } from "./framework.js";
import { h } from "./effects/html.js";
import http from "./effects/http.js";
import sleep from "./effects/sleep.js";
import lock from "./effects/lock.js";
import signal from "./effects/signal.js";
import css from "./effects/css.js";
import interval from "./effects/interval.js";

async function* LockedButton({ children }) {
  let $lock = yield lock.new();

  for await (let _ of $lock) {
    yield (
      <div>
        {children}
        <button on:click={() => $lock.release()}>finish</button>
      </div>
    );
  }

  return { data: 10 };
}

async function* Hello() {
  let name = "";

  // let name_loop = yield interval.each_second(() => {
  //   console.log({ name });
  // });

  let form_style = yield css.rule`
    color: red;
  `;

  let $name_lock = yield lock.new();
  for await (let _ of $name_lock) {
    yield (
      <form on:submit$preventDefault class={form_style}>
        What's your name?
        <input type="checkbox" on:click$preventDefault />
        <input type="text" on:input={(e) => (name = e.target.value)} />
        <button type="submit" on:click={() => $name_lock.release()}>
          Submit
        </button>
      </form>
    );
  }

  // yield interval.stop(name_loop);

  yield <div>Hello, {name}!</div>;
}

let component = make(Hello, document.getElementById("a"));
// let component2 = make(Hello, document.getElementById("b"));

start(component);
// start(component2);
