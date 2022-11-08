import * as capable from "../../../index.js";

export class Circle {
  x: number;
  y: number;
  r: number;
  constructor(x: number, y: number, r: number) {
    this.x = x;
    this.y = y;
    this.r = r;
  }
}

export function circle(x: number, y: number, r: number) {
  return new Circle(x, y, r);
}

capable.runtime.register(Circle, (component, { x, y, r }) => {
  let canvas = component.mount as HTMLCanvasElement;
  let ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
});
