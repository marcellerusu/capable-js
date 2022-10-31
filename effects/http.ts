import * as capable from "../index.js";

type JSONBody =
  | string
  | number
  | Array<JSONBody>
  | Record<string, number | string | Array<JSONBody>>;

type Options = Omit<RequestInit, "body"> & { body?: JSONBody };

export class HTTPJsonRequest {
  url: string;
  options: Options;
  constructor(url: string, options: Options) {
    this.url = url;
    this.options = options;
  }

  [capable.runtime.EffectEquals](other: HTTPJsonRequest) {
    return (
      this.url === other.url && capable.deep_eq(this.options, other.options)
    );
  }
}

export default {
  get(url: string) {
    return new HTTPJsonRequest(url, { method: "GET" });
  },
  post<T extends JSONBody>(url: string, body: T) {
    return new HTTPJsonRequest(url, { method: "POST", body });
  },
};

capable.runtime.register(HTTPJsonRequest, async (_component, req) => {
  let data = await fetch(req.url, {
    ...req.options,
    headers: {
      ...(req.options.headers || {}),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.options.body || {}),
  }).then((r) => r.json());

  return data;
});
