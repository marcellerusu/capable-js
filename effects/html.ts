import * as capable from "../index.js";

export class Fragment {}

function lengths_mismatch(obj1, obj2) {
  return Object.keys(obj1).length !== Object.keys(obj2).length;
}

export class HtmlNode {
  name: string;
  attrs: Record<string, string>;
  children: (HtmlNode | Array<any> | string)[];
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

  [capable.runtime.EffectEquals](other: HtmlNode) {
    if (this === other) return true;
    if (this.name === other.name) return false;
    if (!this.attrs || !other.attrs) return this.attrs === other.attrs;
    if (lengths_mismatch(this.attrs, other.attrs)) return false;
    if (
      Object.entries(this.attrs).some(
        ([key, value]) => value !== other.attrs[key]
      )
    )
      return false;

    if (!this.event_listeners || !other.event_listeners)
      return this.event_listeners === other.event_listeners;

    if (lengths_mismatch(this.event_listeners, other.event_listeners))
      return false;

    // only check they both have same event listeners names
    // no function equality
    if (
      Object.keys(this.event_listeners).some(
        (key) => !other.event_listeners[key]
      )
    )
      return false;

    if (lengths_mismatch(this.children, other.children)) return false;

    return this.children.every((node, i) =>
      node[capable.runtime.EffectEquals](other.children[i])
    );
  }
}

function assert(bool, msg) {
  if (!bool) throw new Error(msg);
}

export function node(
  node_type: AsyncGeneratorFunction | string,
  attrs: Record<string, any>,
  ...children: (HtmlNode | string)[]
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

export function fragment() {
  return new Fragment();
}

async function apply_diff(
  new_node: HtmlNode | any[] | string,
  old_node: HtmlNode | any[] | string | undefined,
  elem: Element
): Promise<Node | null> {
  if (typeof new_node === "string") return new Text(new_node);
  if (new_node instanceof Array) throw new Error("wtf a");
  if (typeof old_node === "string") throw new Error("wtf b");
  if (old_node instanceof Array) throw new Error("wtf c");
  if (!old_node) return new_node.render();
  if (new_node.name !== old_node.name) return new_node.render();
  for (let [name, value] of Object.entries(new_node.attrs || {})) {
    if (new_node[name] !== old_node[name]) {
      elem.setAttribute(name, value);
    }
  }

  assert(
    elem.childNodes.length === new_node.children.length &&
      new_node.children.length === old_node.children.length,
    "same length"
  );
  for (let i = 0; i < new_node.children.length; i++) {
    let new_child = await apply_diff(
      new_node.children[i],
      old_node.children[i],
      elem.childNodes[i] as Element
    );
    if (new_child) {
      elem.replaceChild(new_child, elem.childNodes[i]);
    }
  }
}

capable.runtime.register(
  HtmlNode,
  async function render(component, node, skip_diff = false) {
    if (!component.ctx.elem || skip_diff) {
      component.ctx.elem = await node.render();
      component.mount.replaceChildren(component.ctx.elem);
    } else {
      try {
        let new_elem = await apply_diff(
          node,
          component.ctx.old_node,
          component.ctx.elem
        );
        if (new_elem)
          component.mount.replaceChild(new_elem, component.ctx.elem);
      } catch {
        console.warn("dom diffing failed :(");
        return render(component, node, true);
      }
    }
    component.ctx.old_node = node;
    return component.ctx.elem;
  }
);
