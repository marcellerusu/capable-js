import { make, register, tick } from "../framework.js";

export class HtmlNode {
  name: string;
  attrs: Record<string, string>;
  children: (HtmlNode | FnNode | string)[];
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
    children: (HtmlNode | FnNode | string)[]
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
      } else if (child instanceof FnNode) {
        throw new Error("wtf");
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

class FnNode {
  fn: AsyncGeneratorFunction;
  props: Record<string, string>;
  value;

  constructor(fn: AsyncGeneratorFunction, props: Record<string, any>) {
    this.fn = fn;
    this.props = props;
  }

  async render(component) {
    this.value = await tick(component, () => this.fn(this.props));
    return component.html_node;
  }
}

export function h(
  node_type: AsyncGeneratorFunction | string,
  attrs: Record<string, any>,
  ...children: (HtmlNode | FnNode | string)[]
): HtmlNode | FnNode {
  if (node_type instanceof Function) {
    return new FnNode(node_type, { ...attrs, children });
  } else {
    let event_listeners = {};
    for (let [key, value] of Object.entries(attrs || {})) {
      if (key.match(/on:([a-z]+)/)) {
        delete attrs[key];
        assert(
          value instanceof Function,
          "expected event handler to be a function"
        );
        event_listeners[key.slice(3)] = value;
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

register(FnNode, async function* (component, node) {
  console.log(component);
  let html = await node.render(component);

  yield HtmlNode.fromHtml(html);
});
