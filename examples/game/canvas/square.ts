import * as capable from "../../../index.js";
import { assert } from "../../../utils/assert.js";

export class Square {
  x: number;
  y: number;
  size: number;
  constructor(x: number, y: number, size: number) {
    this.x = x;
    this.y = y;
    this.size = size;
  }
}

export function square(x: number, y: number, size: number) {
  return new Square(x, y, size);
}

capable.runtime.register(Square, (component, { x, y, size }) => {
  assert(component.mount instanceof HTMLCanvasElement, "should be canvas");
  let canvas = component.mount as HTMLCanvasElement;
  let ctx = canvas.getContext("2d");
  ctx.fillRect(x, y, size, size);
});
