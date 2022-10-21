var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Signal_value, _Signal_listeners;
import { register } from "./framework.js";
export class Signal {
    constructor(value) {
        _Signal_value.set(this, void 0);
        _Signal_listeners.set(this, []);
        __classPrivateFieldSet(this, _Signal_value, value, "f");
    }
    has_signal() {
        return false;
    }
    on_change(fn) {
        __classPrivateFieldGet(this, _Signal_listeners, "f").push(fn);
    }
    set value(new_value) {
        __classPrivateFieldSet(this, _Signal_value, new_value, "f");
        __classPrivateFieldGet(this, _Signal_listeners, "f").forEach((fn) => fn());
    }
    get value() {
        return __classPrivateFieldGet(this, _Signal_value, "f");
    }
}
_Signal_value = new WeakMap(), _Signal_listeners = new WeakMap();
register(Signal, (component, sig) => {
    sig.on_change(() => component.restart());
    return sig;
});
