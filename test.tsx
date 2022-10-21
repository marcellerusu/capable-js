import { make, tick } from "./framework.js";
import { h } from "./html.js";
import { Signal } from "./signal.js";
import http from "./http.js";

let count = new Signal(0);

function* Hello() {
  yield <div>loading...</div>;
  let { title, completed } = yield http.get(
    "https://jsonplaceholder.typicode.com/todos/1"
  );
  let $count = yield count;
  yield (
    <p>
      title:{title} - completed:{completed}
      <button on:click={(e) => ($count.value += 1)}>{$count}</button>
    </p>
  );
}

let component = make(Hello, document.body);

tick(component);
