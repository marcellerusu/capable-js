import { make, tick } from "./framework.js";
import { h } from "./effects/html.js";
import signal from "./effects/signal.js";
import http from "./effects/http.js";
import sleep from "./effects/sleep.js";
import lock from "./effects/lock.js";

async function* Hello() {
  yield <div>loading...</div>;

  let { title, completed } = yield http.get(
    "https://jsonplaceholder.typicode.com/todos/1"
  );

  yield (
    <div>
      {title} - {completed}
    </div>
  );

  yield sleep.of(1000);

  let $surveyLock = yield lock.new();

  for await (let _ of $surveyLock) {
    yield (
      <p>
        click continue to move on
        <button on:click={() => $surveyLock.unlock()}>continue</button>
      </p>
    );
  }

  yield <div>You finished the survey</div>;
}

let component = make(Hello, document.getElementById("a"));
let component2 = make(Hello, document.getElementById("b"));

tick(component);
// tick(component2);
