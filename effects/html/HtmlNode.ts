import * as capable from "../../index.js";

export type HtmlNodeChild = HtmlNode | string | AsyncGenerator | Generator;

function lengths_mismatch(
  obj1: Record<string, any>,
  obj2: Record<string, any>
) {
  return Object.keys(obj1).length !== Object.keys(obj2).length;
}

export class HtmlNode {
  name: string;
  attributes: Record<string, string>;
  children: HtmlNodeChild[];
  event_listeners: Record<string, Function>;

  constructor(
    name: string,
    attrs: Record<string, string>,
    event_listeners: Record<string, (e: Event) => any>,
    children: HtmlNodeChild[]
  ) {
    this.name = name;
    this.attributes = attrs;
    this.children = children;
    this.event_listeners = event_listeners;
  }

  [capable.runtime.EffectEquals](other: HtmlNode) {
    if (this === other) return true;
    if (this.name === other.name) return false;
    if (!this.attributes || !other.attributes)
      return this.attributes === other.attributes;
    if (lengths_mismatch(this.attributes, other.attributes)) return false;
    if (
      Object.entries(this.attributes).some(
        ([key, value]) => value !== other.attributes[key]
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
