import { register } from "../framework.js";

class CssNode {
  style: string;
  is_rule: boolean;
  constructor(style: string, { is_rule } = { is_rule: false }) {
    this.style = style;
    this.is_rule = is_rule;
  }
}

function gen_class_name() {
  let unique_num = Array.from({ length: 15 }, () => Math.random() * 10)
    .map((num) => num.toFixed(0))
    .join("");
  return `c-${unique_num}`;
}

register(CssNode, (_component, { style, is_rule }) => {
  let clazz = null;
  if (is_rule) {
    clazz = gen_class_name();
    style = `.${clazz} {${style}}`;
  }
  let sheet = document.styleSheets[0];
  sheet.insertRule(style);
  return clazz;
});

export default {
  global(style: string) {
    return new CssNode(style);
  },
  rule(style) {
    return new CssNode(style, { is_rule: true });
  },
};
