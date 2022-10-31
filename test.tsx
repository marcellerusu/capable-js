import * as capable from "./index.js";
import * as html from "./effects/html.js";
import css from "./effects/css.js";
import form_utils, { FormSubmission } from "./effects/form_utils.js";
import http, { HTTPJsonRequest } from "./effects/http.js";
import sleep from "./effects/sleep.js";

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

  try {
    yield http.post("/api", { name });
  } catch {
    yield <div>error uploading</div>;
    yield sleep.of(1000);
  }

  yield css.global`
    color: hotpink;
  `;

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

  let result = effects.has(http.post("/api", { name: "Marcelle" }));

  if (result) console.log("test passes");
  else console.error("test failed");
}

// it_should_post_name();

let component = capable.runtime.mount(Form, document.getElementById("a"));

capable.runtime.run(component);
