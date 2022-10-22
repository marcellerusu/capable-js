import { make, tick } from "./framework.js";
import { h } from "./effects/html.js";
import signal from "./effects/signal.js";
import http from "./effects/http.js";
import sleep from "./effects/sleep.js";

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

  let $isSurveyFinished = yield signal.of(false);

  for await (let isSurveyFinished of $isSurveyFinished) {
    if (isSurveyFinished) break;

    yield (
      <p>
        click continue to move on
        <button on:click={() => ($isSurveyFinished.value = true)}>
          continue
        </button>
      </p>
    );
  }

  yield <div>You finished the survey</div>;
}

let component = make(Hello, document.getElementById("a"));
let component2 = make(Hello, document.getElementById("b"));

tick(component);
// tick(component2);
