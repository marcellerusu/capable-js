import * as capable from "../../index.js";
import { assert } from "../../utils/assert.js";
import { DiffKind, diff_html_node } from "./diff.js";
import { render_html_node } from "./render.js";
import { HtmlNode } from "./HtmlNode.js";

capable.runtime.register(
  HtmlNode,
  async function to_dom(component, node, skip_diff = false) {
    let old_elem = component.rendered_elem;
    if (!old_elem) {
      component.mount.appendChild(await render_html_node(node));
    } else if (skip_diff) {
      component.mount.replaceChild(await render_html_node(node), old_elem);
    } else {
      assert(
        component.index_in_parent === 0,
        "Can't handle multiple children yet"
      );
      try {
        let result = await diff_html_node(
          node,
          component.ctx.old_node,
          old_elem
        );
        switch (result.kind) {
          case DiffKind.InPlace:
            break;
          case DiffKind.ReplaceElem:
            component.mount.replaceChild(result.elem, old_elem);
            break;
          case DiffKind.ReplaceText:
            assert(false, "Can't replace text at root");
            break;
        }
      } catch (error) {
        console.warn("dom diffing failed :(", error);
        throw error;
        // return to_dom(component, node, true);
      }
    }
    component.ctx.old_node = node;
    return component.rendered_elem;
  }
);

export * from "./jsx.js";
