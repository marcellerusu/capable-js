import * as capable from "./index.js";
import * as html from "./effects/html/index.js";
import css from "./effects/css.js";
import form_utils, { FormSubmission } from "./effects/form_utils.js";
import Game from "./examples/game/index.js";
import http, { HTTPJsonRequest } from "./effects/http.js";

async function* Main() {
  yield* <Game />;
}

async function* Form() {
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

async function it_should_post_name() {
  let component = capable.runtime.mount(Form, null);
  // ignore these effects (just store the effects, don't execute)
  capable.runtime.ignore(html.HtmlNode, HTTPJsonRequest);
  // mock FormSubmission effect to return this form data
  capable.runtime.mock_with_value(FormSubmission, { name: "Marcelle" });
  // run the component
  let [effects, _return_value] = await capable.runtime.run(component);

  let result = effects.has(http.post("/user", { name: "Marcelle" }));

  if (result) console.log("test passes");
  else console.error("test failed");
}

// it_should_post_name();
let component = capable.runtime.mount(Main, document.getElementById("canvas"));
capable.runtime.run(component);
