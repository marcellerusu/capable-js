import { Component, register } from "../framework.js";

class HttpReq {
  url: string;
  method: "get" | "post";
  body: any;
  constructor(url: string, method: "get" | "post", body: any = null) {
    this.url = url;
    this.method = method;
    this.body = body;
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

register(HttpReq, async (_component: Component, req: HttpReq) => {
  if (req.method !== "get") throw new Error("expected http get to be a get");
  let data = await fetch(req.url).then((r) => r.json());
  return data;
});
