import { assert } from "../../utils/assert.js";
import { is_async_generator, is_generator } from "../../utils/generators.js";
import { render_html_node } from "./render.js";
import { HtmlNode, HtmlNodeChild } from "./HtmlNode.js";

export enum DiffKind {
  InPlace,
  ReplaceText,
  ReplaceElem,
}

type DiffResult =
  | { kind: DiffKind.InPlace }
  | { kind: DiffKind.ReplaceText; text_node: Text }
  | { kind: DiffKind.ReplaceElem; elem: HTMLElement };

const InPlace: DiffResult = { kind: DiffKind.InPlace };

function ReplaceText(text_node: Text): DiffResult {
  return { kind: DiffKind.ReplaceText, text_node };
}

function ReplaceElem(elem: HTMLElement): DiffResult {
  return { kind: DiffKind.ReplaceElem, elem };
}

function zip3<A, B, C>(
  array1: A[],
  array2: ArrayLike<B>,
  array3: ArrayLike<C>
): [A, B, C][] {
  return array1.map((x, i) => [x, array2[i], array3[i]]);
}

function is_a<T extends new (...args: any) => any>(
  obj: any,
  Klass: T
): obj is InstanceType<T> {
  return obj instanceof Klass;
}

async function diff_child(
  new_node: HtmlNodeChild,
  old_node: HtmlNodeChild,
  elem: ChildNode
): Promise<DiffResult> {
  if (typeof new_node === "string") {
    assert(elem instanceof Text, "old elem should be a text node");
    return ReplaceText(new Text(new_node));
  } else if (
    is_a(new_node, HtmlNode) &&
    is_a(old_node, HtmlNode) &&
    is_a(elem, HTMLElement)
  ) {
    return diff_html_node(new_node, old_node, elem);
  } else if (is_async_generator(new_node) || is_generator(new_node)) {
    throw new Error("Not sure how to diff generators");
  } else {
    console.warn("unknown", { new_node, old_node, elem });
    throw new Error("unknown diff pattern");
  }
}

async function diff_children(
  new_children: HtmlNodeChild[],
  old_children: HtmlNodeChild[],
  elem_children: NodeListOf<ChildNode>
): Promise<void> {
  assert(new_children.length === new_children.length, "array same length");
  assert(
    new_children.length === elem_children.length,
    "array length should match child nodes"
  );

  for (let [new_node, old_node, elem] of zip3(
    new_children,
    old_children,
    elem_children
  )) {
    let result = await diff_child(new_node, old_node, elem);

    switch (result.kind) {
      case DiffKind.InPlace:
        break;
      case DiffKind.ReplaceText:
        assert(elem instanceof Text, "replace text only works on #text");
        elem.nodeValue = result.text_node.nodeValue;
        break;
      case DiffKind.ReplaceElem:
        elem.replaceChild(result.elem, elem);
        break;
    }
  }
}

export async function diff_html_node(
  new_node: HtmlNode,
  old_node: HtmlNode | undefined,
  elem: HTMLElement
): Promise<DiffResult> {
  if (!old_node) return ReplaceElem(await render_html_node(new_node));
  if (new_node.name !== old_node.name)
    return ReplaceElem(await render_html_node(new_node));

  await diff_children(new_node.children, old_node.children, elem.childNodes);

  for (let [name, value] of Object.entries(new_node.attributes)) {
    if (new_node[name] !== old_node[name]) {
      elem.setAttribute(name, value);
    }
  }

  return InPlace;
}
