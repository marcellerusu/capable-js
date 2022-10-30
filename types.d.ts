import { HtmlNode } from "./effects/html";
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: HtmlNode;
  }
}

