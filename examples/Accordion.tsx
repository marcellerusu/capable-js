import css from "../effects/css.js";
import * as html from "../effects/html/render.js";
import signal from "../effects/signal.js";
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

export async function* AccordionItem({ title, children }) {
  let style = yield css.class`
  `;

  let $text = signal.of("yo");

  for await (let text of $text) {
    console.log("here");
    yield (
      <details class={style} open>
        <summary>{title}</summary>
        {children}
        <input type="text" />
        <p>{text}</p>
      </details>
    );
  }
}

export function* Accordion({ children }) {
  yield <div>{children}</div>;
}
