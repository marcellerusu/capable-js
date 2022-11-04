import { assert } from "../../utils/assert.js";
import * as capable from "../../index.js";

class Resize {
  width: number;
  height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

export function resize(width: number, height: number) {
  return new Resize(width, height);
}

capable.runtime.register(Resize, (component, { width, height }) => {
  assert(component.mount instanceof HTMLCanvasElement, "should be canvas");
  let canvas = component.mount as HTMLCanvasElement;
  canvas.width = width;
  canvas.height = height;
});

class Square {
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

class Clear {}
export function clear() {
  return new Clear();
}
capable.runtime.register(Clear, (component, _) => {
  let canvas = component.mount as HTMLCanvasElement;
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
