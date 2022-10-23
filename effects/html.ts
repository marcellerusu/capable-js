import { register } from "../framework.js";

export class HtmlNode {
  name: string;
  attrs: Record<string, string>;
  children: (HtmlNode | Array<any> | AsyncGenerator | string)[];
  event_listeners: Record<string, Function>;
  rendered_html: HTMLElement;

  static fromHtml(html: HTMLElement) {
    let result = new this(null, {}, {}, []);
    result.rendered_html = html;
    return result;
  }

  constructor(
    name: string,
    attrs: Record<string, string>,
    event_listeners: Record<string, Function>,
    children: (HtmlNode | Array<any> | string)[]
  ) {
    this.name = name;
    this.attrs = attrs;
    this.children = children;
    this.event_listeners = event_listeners;
  }

  async render(): Promise<HTMLElement> {
    if (this.rendered_html) return this.rendered_html;
    let elem = document.createElement(this.name);

    for (let child of this.children) {
      if (child instanceof HtmlNode) {
        elem.appendChild(await child.render());
      } else if (child instanceof Array) {
        for (let c of child) {
          elem.appendChild(await c.render());
        }
      } else if (child.toString() === "[object AsyncGenerator]") {
        console.log("trying to render async gne");
        for await (let val of child) {
          console.log(val, child);
          if (val instanceof HtmlNode) elem.appendChild(await val.render());
          console.log(val, child);
        }
      } else {
        elem.appendChild(new Text(child));
      }
    }
    for (let [key, value] of Object.entries(this.attrs || {})) {
      elem.setAttribute(key, value);
    }
    for (let [event_name, handler] of Object.entries(this.event_listeners)) {
      elem.addEventListener(event_name, handler as any);
    }
    return elem;
  }
}

function assert(bool, msg) {
  if (!bool) throw new Error(msg);
}

export function h(
  node_type: AsyncGeneratorFunction | string,
  attrs: Record<string, any>,
  ...children: (HtmlNode | AsyncGenerator | string)[]
): HtmlNode | AsyncGenerator {
  if (node_type instanceof Function) {
    return node_type({ ...attrs, children });
  } else {
    let event_listeners = {};
    for (let [key, value] of Object.entries(attrs || {})) {
      if (key.match(/on:([a-z]+)/)) {
        delete attrs[key];
        let rest_of_key = key.slice(3);
        if (rest_of_key.includes("$")) {
          let [name, method] = rest_of_key.split("$");
          event_listeners[name] = (e) => e[method]();
        } else {
          assert(
            value instanceof Function,
            "expected event handler to be a function"
          );
          event_listeners[rest_of_key] = value;
        }
      }
    }

    return new HtmlNode(node_type, attrs, event_listeners, children);
  }
}

register(HtmlNode, async (component, node) => {
  component.html_node = await node.render();
  component.invalidate();
  return node;
});
