export const GeneratorFunction = function* () {}.constructor;
export const AsyncGeneratorFunction = async function* () {}.constructor;

export function is_generator(fn: unknown): fn is Generator {
  return fn?.constructor?.constructor === GeneratorFunction;
}

export function is_async_generator(fn: unknown): fn is AsyncGenerator {
  return fn?.constructor?.constructor === AsyncGeneratorFunction;
}
