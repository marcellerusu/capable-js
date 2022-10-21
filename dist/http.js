import { register } from "./framework.js";
class HttpReq {
    constructor(url, method, body = null) {
        this.url = url;
        this.method = method;
        this.body = body;
    }
    has_signal() {
        return false;
    }
}
export default {
    get(url) {
        return new HttpReq(url, "get");
    },
    post(url, body) {
        return new HttpReq(url, "post", body);
    },
};
let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
register(HttpReq, async (_component, req) => {
    if (req.method !== "get")
        throw new Error("expected http get to be a get");
    await sleep(1000);
    let data = await fetch(req.url).then((r) => r.json());
    return data;
});
