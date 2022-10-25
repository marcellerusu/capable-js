import { make, start } from "./framework.js";
import { h } from "./effects/html.js";
import lock from "./effects/lock.js";
import css from "./effects/css.js";
import signal from "./effects/signal.js";

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
async function* NameForm() {
  let $name = signal.of("");
  let $name_lock = yield lock.new();
  for await (let _ of $name) {
    yield (
      <form on:submit$preventDefault>
        What's your name?
        <input type="text" on:input={(e) => ($name.value = e.target.value)} />
        <button type="submit" on:click={() => $name_lock.release()}>
          {$name.value}
        </button>
      </form>
    );
  }

  // note this is a return, not a yield
  return name;
}

async function* Main() {
  let name = yield* <NameForm />;
  yield <div>Hello, {name}!</div>;
}

let component = make(Main, document.getElementById("a"));
// let component2 = make(Hello, document.getElementById("b"));

start(component);
// start(component2);
