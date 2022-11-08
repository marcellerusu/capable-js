import { assert } from "../../../utils/assert.js";
import * as capable from "../../../index.js";

let scaled = false;
function scale(canvas: HTMLCanvasElement) {
  if (scaled) return;
  scaled = true;
  let originalWidth = canvas.width;
  let originalHeight = canvas.height;
  let dimensions = getObjectFitSize(canvas);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = dimensions.width * dpr;
  canvas.height = dimensions.height * dpr;

  let ctx = canvas.getContext("2d");
  let ratio = Math.min(
    canvas.clientWidth / originalWidth,
    canvas.clientHeight / originalHeight
  );
  ctx.scale(ratio * dpr, ratio * dpr);
}

function getObjectFitSize(canvas: HTMLCanvasElement) {
  let document_ratio = canvas.width / canvas.height;
  let client_ratio = canvas.clientWidth / canvas.clientHeight;
  let width = 0;
  let height = 0;

  if (document_ratio > client_ratio) {
    width = canvas.clientWidth;
    height = width / document_ratio;
  } else {
    height = canvas.clientHeight;
    width = height * document_ratio;
  }

  return { width, height };
}

export class Resize {
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
  scale(canvas);
});
