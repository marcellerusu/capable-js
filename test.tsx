import * as capable from "./index.js";
import * as html from "./effects/html/index.js";
import css from "./effects/css.js";
import form_utils from "./effects/form_utils.js";

async function* Main() {
  let form_style = yield css.class`
    display: flex;
    justify-content: space-between;
    background: lightgray;
    padding: 1em;
    border-radius: 5px;
  `;

  // first render
  let form = yield (
    <form class={form_style} on:submit$preventDefault>
      What's your name?
      <input type="text" name="name" />
      <button type="submit">Submit</button>
    </form>
  );

  let { name } = yield form_utils.on_submit(form);

  yield css.global`
    color: hotpink;
  `;

  // second render
  yield <div>Hey, {name}!</div>;
}

let component = capable.runtime.mount(Main, document.getElementById("a"));
capable.runtime.run(component);
