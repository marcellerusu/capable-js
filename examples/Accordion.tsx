import css from "../effects/css.js";
import { on } from "../effects/events.js";
import * as html from "../effects/html.js";

export function* AccordionItem({ title, children }) {
  let style = yield css.class`
  `;

  let details = yield (
    <details class={style}>
      <summary>{title}</summary>
      {children}
    </details>
  );

  yield on.click(details);
  window.dispatchEvent(new Event("opened"));
}

export function* Accordion({ children }) {
  yield <div>{children}</div>;
}
