import * as capable from "../../index.js";
import { is_async_generator, is_generator } from "../../utils/generators.js";
import { HtmlNode } from "./HtmlNode.js";

export async function render_html_node(
  html_node: HtmlNode
): Promise<HTMLElement> {
  let elem = document.createElement(html_node.name);

  for (let [idx, child] of html_node.children.entries()) {
    if (child instanceof HtmlNode) {
      elem.appendChild(await render_html_node(child));
    } else if (is_generator(child) || is_async_generator(child)) {
      // not sure why typescript can't infer this
      let generator = child;
      let component = capable.runtime.mount(() => generator, elem, idx);
      capable.runtime.run(component);
    } else {
      elem.appendChild(new Text(child));
    }
  }
  for (let [key, value] of Object.entries(html_node.attributes)) {
    elem.setAttribute(key, value);
  }
  for (let [event_name, handler] of Object.entries(html_node.event_listeners)) {
    elem.addEventListener(event_name, handler as any);
  }
  return elem;
}
