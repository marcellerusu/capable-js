# A simple Front-End runtime built on async generators

A runtime that brings linear (top-to-bottom) reasoning to an async world.

# Hello Example

```jsx
async function* Hello() {
  let form_style = yield css.class`
    display: flex;
    justify-content: space-between;
    background: lightgray;
    padding: 1em;
    border-radius: 5px;
  `;
  
  // first render
  let form = yield (
    <form class={form_style}>
      What's your name?
      <input type="text" name="name" />
      <button type="submit">Submit</button>
    </form>
  );

  let { name } = yield on.submit(form);

  yield css.global`
    color: hotpink;
  `;

  // second render
  yield <div>Hey, {name}!</div>;
}
```

- First Render
<img width="581" alt="Screen Shot 2022-10-30 at 10 22 33 AM" src="https://user-images.githubusercontent.com/7607387/198886750-b69e8623-aea9-4523-9c4b-7b6e9da99237.png">
- User Input
<img width="585" alt="Screen Shot 2022-10-30 at 10 23 15 AM" src="https://user-images.githubusercontent.com/7607387/198886783-92c9fcee-acda-4a31-ae75-75cfa285f2c6.png">
- Second Render
<img width="216" alt="Screen Shot 2022-10-30 at 10 23 37 AM" src="https://user-images.githubusercontent.com/7607387/198886793-6db9454d-ac70-4492-8dc0-6a73a7a7d586.png">


## Equivalent React Code

```jsx
function Hello() {
  let [name, setName] = useState("");
  let [isSubmitted, setIsSubmitted] = useState(false);

  if (!isSubmitted) {
    return (
      <form>
        What's your name?
        <input type="text" onChange={(e) => setName(e.target.value)} />
        <button type="submit" on:click={() => setIsSubmitted(true)}>
          Submit
        </button>
      </form>
    );
  } else {
    return <div>Hello, {name}!</div>;
  }
}
```

The important distinction isn't that our new code is shorter, but rather that our code flows from top to bottom.

In react, the structure of the code has nothing to say if we'll see the form first or the hello name first.

Its imbued in the logic.

In capable-js, components don't get "re-rendered", it flows from top to bottom & only once. So you don't have worry about if some state/logic from a "later state" interferes with an earlier state.

This also means the "capable-js" runtime is very straightforward, in fact its more or less just the runtime of async generators, our framework just takes care of resolving "effects".

In react the thought of having a multi-stage component like this is most definitely a "code smell", but in capable-js, its completely natural & sane (within reason).

## Components that "finish"

In React (or similar) there's no notion of a "finished" component, it just gets unmounted by the parent when its no longer relevant.

Sometimes it would be nice to know that a component is finished it's work, for example a mutli-part survey finishes when you go through all the steps & press "finish", at the end you then get the a data object.

This is trivial in capable-js

```jsx
async function* NameForm() {
  let name = "";
  let $name_lock = yield lock.new();
  for await (let _ of $name_lock) {
    yield (
      <form>
        What's your name?
        <input type="text" on:input={(e) => (name = e.target.value)} />
        <button type="submit" on:click={() => $name_lock.release()}>
          Submit
        </button>
      </form>
    );
  }

  // note this is a return, not a yield
  return name;
}

async function* Main() {
  let name = yield* <NameForm />;
  yield <div>Hello, {name}!</div>;
}
```

You'll notice a `yield*`, this is basically delegating to another generator until it finishes. So we give control over the the NameForm & then get the result.

Imagine there's multiple stages to this

```jsx
async function* Main() {
  let { name, email } = yield* <UserDetailForm />;
  let { preferred_os } = yield* <PreferencesForm />;

  let is_confirmed = yield* (
    <Confirmation data={{ name, email, preferred_os }} />
  );

  if (!is_confirmed) return <Error>Not Submitted</Error>;

  yield <Success>You did it!</Success>;
}
```

You can see how far we can go with this notion. The heavy lifting of pausing the component for user input is all handled by async generators themselves.

Generators turn out to be a very neat analogy for user input.

We give (yield) the user some html & wait for some input (pause execution), and then display more html based off that output.

## Managed Effects

capable-js is also a mostly "pure" runtime, effects like drawing html & doing http requests are lazy. We yield descriptions of tasks instead of executing the task itself.

The effect system is also completely pluggable, you can define & insert your own effects. In fact if you wanted you could replace the html & http effects to have a different runtime.
