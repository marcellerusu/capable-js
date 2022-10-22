export class Component {
  fn: () => AsyncGenerator;
  html_node: HTMLElement;
  mount: HTMLElement;
  constructor(fn: () => AsyncGenerator, mount: HTMLElement) {
    this.mount = mount;
    this.fn = fn;
  }

  invalidate() {
    this.mount.replaceChildren(this.html_node);
  }
}

export function make(component_fn: () => AsyncGenerator, mount: HTMLElement) {
  return new Component(component_fn, mount);
}

let handlers: Map<Function, (...args: any[]) => any> = new Map();

export function register<T>(
  type: { new (...args: any[]): T },
  handler: (component: Component, effect: T) => any
) {
  handlers.set(type, handler);
}

export async function tick(component: Component) {
  let gen = component.fn();
  let done = false,
    action = null,
    last_result = null;
  do {
    ({ value: action, done } = await gen.next(last_result));
    if (done) break;

    let handler = handlers.get((action as any).constructor);
    last_result = await handler?.(component, action);
    if (!handler)
      throw new Error("unknown handler " + (action as any).constructor.name);
  } while (!done);
}
