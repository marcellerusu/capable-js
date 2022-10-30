import * as capable from "./index.js";
import { h } from "./effects/html.js";
import css from "./effects/css.js";
import form_utils from "./effects/form_utils.js";

async function* Form() {
  let form_style = yield css.class`
    display: flex;
    justify-content: space-between;
    background: lightgray;
    padding: 1em;
    border-radius: 5px;
  `;

  let form = yield (
    <form class={form_style}>
      What's your name?
      <input type="text" name="name" />
      <button type="submit">Submit</button>
    </form>
  );

  let { name } = yield form_utils.on_submit(form);

  yield css.global`
    color: hotpink;
  `;

  yield <div>Hey, {name}!</div>;
}

let component = capable.runtime.mount(Form, document.getElementById("a"));

capable.runtime.start(component);
