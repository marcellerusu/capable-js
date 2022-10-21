import { register } from "./framework.js";
import { Signal } from "./signal.js";
export class HtmlNode {
    constructor(name, attrs, event_listeners, children) {
        this.name = name;
        this.attrs = attrs;
        this.children = children;
        this.event_listeners = event_listeners;
    }
    has_signal() {
        return this.children.some((c) => {
            if (c instanceof Signal) {
                return true;
            }
            else if (c instanceof HtmlNode) {
                return c.has_signal();
            }
            else {
                return false;
            }
        });
    }
    render_attrs() {
        if (!this.attrs)
            return "";
        return (" " +
            Object.entries(this.attrs || {})
                .map(([key, value]) => `${key}=${value}`)
                .join(" "));
    }
    render() {
        let elem = document.createElement(this.name);
        for (let child of this.children) {
            if (child instanceof HtmlNode)
                elem.appendChild(child.render());
            else if (child instanceof Signal)
                elem.appendChild(new Text(child.value));
            else
                elem.appendChild(new Text(child));
        }
        for (let [key, value] of Object.entries(this.attrs || {})) {
            elem.setAttribute(key, value);
        }
        for (let [event_name, handler] of Object.entries(this.event_listeners)) {
            elem.addEventListener(event_name, handler);
        }
        return elem;
    }
    destroy(elem) {
        for (let [event_name, handler] of Object.entries(this.event_listeners)) {
            elem.removeEventListener(event_name, handler);
        }
    }
}
function assert(bool, msg) {
    if (!bool)
        throw new Error(msg);
}
export function h(name, attrs, ...children) {
    let event_listeners = {};
    for (let [key, value] of Object.entries(attrs || {})) {
        if (key.match(/on:([a-z]+)/)) {
            delete attrs[key];
            assert(value instanceof Function, "expected event handler to be a function");
            event_listeners[key.slice(3)] = value;
        }
    }
    return new HtmlNode(name, attrs, event_listeners, children);
}
export function html() { }
register(HtmlNode, (component, node) => {
    component.html_node = node.render();
    component.on_destroy((elem) => node.destroy(elem));
    component.invalidate();
    return component.html_node;
});
