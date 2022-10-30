import * as capable from "./index.js";
import { h } from "./effects/html.js";
import lock from "./effects/lock.js";
import css from "./effects/css.js";
import http from "./effects/http.js";

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
  let name = "";
  let $name_lock = yield lock.new();
  for await (let _ of $name_lock) {
    console.log($name_lock);
    yield (
      <form on:submit$preventDefault>
        What's your name?
        <input type="text" on:input={(e) => (name = e.target.value)} />
        <button type="submit" on:click={() => $name_lock.release()}>
          Submit
        </button>
      </form>
    );
  }
  // note this is a return, not a yield
  return name;
}

class Log {
  msg: string;
  constructor(msg: string) {
    this.msg = msg;
  }
}

capable.runtime.register(Log, (_component, log_cmd) => {
  console.log(log_cmd.msg);
});

async function* Main() {
  yield new Log("hello there");
}

let component = capable.runtime.mount(Main, document.getElementById("a"));

capable.runtime.start(component);
