import * as capable from "../../../index.js";

export class Clear {}
export function clear() {
  return new Clear();
}
capable.runtime.register(Clear, (component, _) => {
  let canvas = component.mount as HTMLCanvasElement;
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
