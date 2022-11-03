import { assert } from "../../utils/assert.js";
import { Signal } from "../signal.js";
import { HtmlNode } from "./HtmlNode.js";

type TargetedEvent<
  Target extends EventTarget = EventTarget,
  TypedEvent extends Event = Event
> = Omit<TypedEvent, "currentTarget"> & {
  readonly currentTarget: Target;
  readonly target: Target;
};

// this is the jsx hook that turns jsx into something "capable" can understand
export function node(
  node_type: AsyncGeneratorFunction | string,
  attributes: Record<string, any>,
  ...children: HtmlNode[]
): HtmlNode | AsyncGenerator {
  if (node_type instanceof Function) {
    // <CustomComponent attribute_name={"Attribute Value"} />
    return fn_node(node_type, attributes, children);
  } else {
    return html_node(node_type, attributes, children);
  }
}

function fn_node(
  component_fn: AsyncGeneratorFunction,
  attributes: Record<string, any>,
  children: HtmlNode[]
) {
  return component_fn({ ...attributes, children });
}

const GENERIC_EVENT = new Event("");

function parse_event_listener(key: string, original_fn: (e: Event) => any) {
  let rest_of_key = key.slice(3);
  let event_name: string;
  let fn: (e: Event) => any;
  if (rest_of_key.includes("$")) {
    let [name, method] = rest_of_key.split("$");
    assert(method in GENERIC_EVENT, `${method} is not a known event method`);
    event_name = name;
    if (typeof original_fn === "function") {
      fn = (e) => {
        e[method]();
        return original_fn(e);
      };
    } else {
      fn = (e) => e[method]();
    }
  } else {
    assert(typeof original_fn === "function", `${key} expected a function`);
    event_name = rest_of_key;
    fn = original_fn;
  }
  return [event_name, fn] as const;
}

function html_node(
  type: string,
  attributes: Record<string, any>,
  children: HtmlNode[]
) {
  attributes ||= {};
  let event_listeners: Record<string, (e: Event) => any> = {};
  for (let [key, value] of Object.entries(attributes)) {
    if (key.match(/on:([a-z]+)/)) {
      delete attributes[key];
      let [event_name, fn] = parse_event_listener(key, value);
      event_listeners[event_name] = fn;
    } else if (key === "bind:value") {
      delete attributes[key];
      assert(
        type === "input" && attributes["type"] === "text",
        `bind:value only works on <input type="text" ... />`
      );
      assert(value instanceof Signal, "bind:value should be a signal");
      let signal = value;
      event_listeners["input"] = (e: TargetedEvent<HTMLInputElement>) =>
        (signal.value = e.target.value);
      attributes["value"] = signal.value;
    }
  }

  return new HtmlNode(type, attributes, event_listeners, children);
}

export function fragment() {
  return new Fragment();
}

export class Fragment {}
