import * as capable from "../index.js";

export class HttpReq {
  url: string;
  method: "get" | "post";
  body: any;
  constructor(url: string, method: "get" | "post", body: any = null) {
    this.url = url;
    this.method = method;
    this.body = body;
  }

  [capable.runtime.EffectEquals](other: HttpReq) {
    return (
      this.url === other.url &&
      this.method === other.method &&
      capable.deep_eq(this.body, other.body)
    );
  }
}

export default {
  get(url: string) {
    return new HttpReq(url, "get");
  },
  post<T>(url: string, body: T) {
    return new HttpReq(url, "post", body);
  },
};

capable.runtime.register(HttpReq, async (_component, req) => {
  if (req.method !== "get") throw new Error("expected http get to be a get");
  let data = await fetch(req.url).then((r) => r.json());
  return data;
});
