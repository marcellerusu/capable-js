export class Variant<Kinds extends Record<string, any>> {
  kind: keyof Kinds;
  data: Kinds[keyof Kinds];
  constructor(kind: keyof Kinds, data: Kinds[string]) {
    this.kind = kind;
    this.data = data;
  }
  match(match_obj: { [s in keyof Kinds]: (data: Kinds[s]) => any }) {
    return match_obj[this.kind](this.data);
  }
}

export type ResultOf<T extends Record<string, any>> = {
  [key in keyof T]: Variant<T>;
}[keyof T];
