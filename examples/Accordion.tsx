import css from "../effects/css.js";
import * as html from "../effects/html.js";
import sleep from "../effects/sleep.js";
import * as capable from "../index.js";

class ReplaceText {
  elem: HTMLElement;
  new_text: string;
  constructor(elem: HTMLElement, new_text: string) {
    this.elem = elem;
    this.new_text = new_text;
  }
}

function replace_text(elem: HTMLElement, new_text: string) {
  return new ReplaceText(elem, new_text);
}

capable.runtime.register(ReplaceText, (_component, { elem, new_text }) => {
  if ([...elem.childNodes].some((x) => !(x instanceof Text)))
    throw new Error("trying to replace non text nodes");
  elem.innerText = new_text;
});

export function* AccordionItem({ title, children }) {
  let style = yield css.class`
  `;

  let details = yield (
    <details class={style}>
      <summary>{title}</summary>
      {children}
    </details>
  );

  if (title === "Hey") {
    yield sleep.of(1000);
    yield replace_text(details.querySelector("summary"), "sup");
  }
}

export function* Accordion({ children }) {
  yield <div>{children}</div>;
}
