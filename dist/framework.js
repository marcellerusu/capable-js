export class Component {
    constructor(fn, mount) {
        this.cache = [];
        this.destroy_listeners = [];
        this.mount = mount;
        this.fn = fn;
    }
    invalidate() {
        this.mount.replaceChildren(this.html_node);
    }
    on_destroy(fn) {
        this.destroy_listeners.push(fn);
    }
    call_destroy_listeners() {
        this.destroy_listeners.forEach((f) => f(this.html_node));
    }
    async restart() {
        this.call_destroy_listeners();
        await tick(this, true);
    }
}
export function make(component_fn, mount) {
    return new Component(component_fn, mount);
}
let handlers = new Map();
export function register(type, handler) {
    handlers.set(type, handler);
}
export async function tick(component, only_signals = false) {
    let gen = component.fn();
    let done = false, action = null, last_result = null, i = 0;
    do {
        ({ value: action, done } = gen.next(last_result));
        if (done)
            break;
        if (only_signals && !action.has_signal()) {
            last_result = component.cache[i];
            i++;
            continue;
        }
        let handler = handlers.get(action.constructor);
        last_result = await handler?.(component, action);
        component.cache[i] = last_result;
        i++;
        if (!handler)
            throw new Error("unknown handler " + action.constructor.name);
    } while (!done);
}
