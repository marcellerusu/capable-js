export class Component {
  fn: () => AsyncGenerator;
  html_node: HTMLElement;
  mount: HTMLElement;
  constructor(fn: () => AsyncGenerator, mount: HTMLElement) {
    this.mount = mount;
    this.fn = fn;
  }

  invalidate() {
    this.mount?.replaceChildren(this.html_node);
  }
}

export function make(component_fn: () => AsyncGenerator, mount?: HTMLElement) {
  return new Component(component_fn, mount);
}

type ClassOf<T> = { new (...args: any[]): T };
type Handler<T> = (
  component: Component,
  effect: T
) => T | Promise<any> | AsyncGenerator | void | any;

let handlers: Map<ClassOf<any>, Handler<any>> = new Map();

export function register<T>(type: ClassOf<T>, handler: Handler<T>) {
  handlers.set(type, handler);
}

export async function start(component: Component) {
  let gen = component.fn();
  let gen_state: IteratorResult<any>;
  let yield_result = null;
  do {
    gen_state = await gen.next(yield_result);
    if (gen_state.done) break;
    let effect = gen_state.value;
    if (!handlers.has(effect.constructor))
      throw new Error("unknown handler " + effect.constructor.name);
    let effect_handler = handlers.get(effect.constructor);
    yield_result = await effect_handler(component, effect);
  } while (!gen_state.done);
  return gen_state.value;
}
