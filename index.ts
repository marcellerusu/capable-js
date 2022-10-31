export * as runtime from "./runtime.js";

function array_eq(a, b) {
  if (!(b instanceof Array)) return false;
  return a.length === b.length && a.every((x, i) => deep_eq(x, b[i]));
}

function primitive_eq(a, b) {
  if (typeof b !== typeof a) return false;
  return a === b;
}

const PRIMITIVES = [
  "string",
  "number",
  "bigint",
  "boolean",
  "symbol",
  "undefined",
  "function",
];

export function deep_eq(a: any, b: any) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (PRIMITIVES.includes(typeof a)) return primitive_eq(a, b);
  if (a instanceof Array) return array_eq(a, b);
  if (Object.keys(a).length !== Object.keys(b).length) return false;
  return Object.entries(a).every(([key, value]) => deep_eq(value, b[key]));
}
