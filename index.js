define("framework", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tick = exports.register = exports.make = exports.Component = void 0;
    class Component {
        constructor(fn) {
            this.html_str = "";
            this.fn = fn;
        }
    }
    exports.Component = Component;
    function make(component_fn) {
        return new Component(component_fn);
    }
    exports.make = make;
    let handlers = new Map();
    function register(type, handler) {
        handlers.set(type, handler);
    }
    exports.register = register;
    async function tick(component) {
        let gen = component.fn();
        let done = false, action = null, last_result = null;
        do {
            ({ value: action, done } = gen.next(last_result));
            if (done)
                break;
            let handler = handlers.get(action.constructor);
            last_result = await handler?.(component, action);
            if (!handler)
                throw new Error("unknown handler " + action.constructor.name);
        } while (!done);
    }
    exports.tick = tick;
});
define("html", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.html = exports.h = exports.HtmlNode = void 0;
    class HtmlNode {
        constructor(name, attrs, children) {
            this.name = name;
            this.attrs = attrs;
            this.children = children;
        }
        render_attrs() {
            if (!this.attrs)
                return "";
            return (" " +
                Object.entries(this.attrs)
                    .map(([key, value]) => `${key}=${value}`)
                    .join(" "));
        }
        render(indentation = 0) {
            let indent = Array.from({ length: indentation }).join(" ");
            let children_s = "";
            for (let child of this.children) {
                children_s += indent;
                if (child instanceof HtmlNode)
                    children_s += child.render(indentation + 2);
                else
                    children_s += child;
                children_s += "\n";
            }
            children_s = children_s.trimEnd();
            return `${indent}<${this.name}${this.render_attrs()}>\n${children_s}\n${indent}</${this.name}>`;
        }
    }
    exports.HtmlNode = HtmlNode;
    function h(name, attrs, ...children) {
        return new HtmlNode(name, attrs, children);
    }
    exports.h = h;
    function html() { }
    exports.html = html;
});
define("test", ["require", "exports", "framework", "html"], function (require, exports, framework_1, html_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HttpReq {
        constructor(url, method, body = null) {
            this.url = url;
            this.method = method;
            this.body = body;
        }
    }
    let http = {
        get(url) {
            return new HttpReq(url, "get");
        },
        post(url, body) {
            return new HttpReq(url, "post", body);
        },
    };
    framework_1.register(HttpReq, async (_component, req) => {
        if (req.method !== "get")
            throw new Error("expected http get to be a get");
        let data = await fetch(req.url).then((r) => r.json());
        return data;
    });
    framework_1.register(html_1.HtmlNode, (component, node) => {
        component.html_str = node.render();
        return component.html_str;
    });
    function* Hello() {
        yield html_1.h("div", null, "loading...");
        let { title, completed } = yield http.get("https://jsonplaceholder.typicode.com/todos/1");
        yield (html_1.h("p", null,
            "title:",
            title,
            " - completed:",
            completed));
    }
    let component = framework_1.make(Hello);
    framework_1.tick(component).then(() => {
        console.log(component.html_str);
    });
    console.log("wtf");
});
