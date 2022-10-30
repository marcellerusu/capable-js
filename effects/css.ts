import * as capable from "../index.js";

class CssNode {
  style: string;
  constructor(style: string) {
    this.style = style;
  }
}

class GlobalCssNode extends CssNode {}
class NamedCssRule extends CssNode {}

capable.runtime.register(GlobalCssNode, (_component, { style }) => {
  let css = `* {${style}}`;
  document.styleSheets[0].insertRule(css);
});

function gen_class_name() {
  let unique_num = Array.from({ length: 15 }, () => Math.random() * 10)
    .map((num) => num.toFixed(0))
    .join("");
  return `c-${unique_num}`;
}

capable.runtime.register(NamedCssRule, (_component, { style }) => {
  let clazz = gen_class_name();
  let css = `.${clazz} {${style}}`;
  document.styleSheets[0].insertRule(css);
  return clazz;
});

export default {
  global(style) {
    return new GlobalCssNode(style);
  },
  class(style) {
    return new NamedCssRule(style);
  },
};
