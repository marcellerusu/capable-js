export class Component {
  fn: () => AsyncGenerator;
  mount: HTMLElement;
  ctx: Record<string, any> = {};
  constructor(fn: () => AsyncGenerator, mount: HTMLElement) {
    this.mount = mount;
    this.fn = fn;
  }
}

export let EffectEquals = Symbol("effect-equals");

export function mount(component_fn: () => AsyncGenerator, mount?: HTMLElement) {
  return new Component(component_fn, mount);
}

export function test_mount(component_fn: () => AsyncGenerator) {
  return new Component(component_fn, null);
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

export function ignore<T>(...effects: ClassOf<any>[]) {
  for (let Effect of effects) {
    register<T>(Effect, (_component, value) => value);
  }
}

export function mock<T>(Effect: ClassOf<T>, fn: Handler<T>) {
  register<T>(Effect, fn);
}

export function mock_with_value<T>(Effect: ClassOf<T>, value) {
  register<T>(Effect, () => value);
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

class Effects extends Array {
  has(effect) {
    for (let item of this) {
      if (item[EffectEquals](effect)) return true;
    }
    return false;
  }
}

export async function run(component: Component): Promise<[Effects, any]> {
  let gen = component.fn();
  let gen_state: IteratorResult<any>;
  let yield_result = null;
  let effects = new Effects();
  do {
    gen_state = await gen.next(yield_result);
    if (gen_state.done) break;
    let effect = gen_state.value;
    effects.push(effect);
    if (!handlers.has(effect.constructor))
      throw new Error("unknown handler " + effect.constructor.name);
    let effect_handler = handlers.get(effect.constructor);
    yield_result = await effect_handler(component, effect);
  } while (!gen_state.done);
  return [effects, gen_state.value];
}
