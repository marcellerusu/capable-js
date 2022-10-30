import * as capable from "../index.js";
class EventHandler {
  target;
  event_name: string;
  constructor(target, event_name) {
    this.target = target;
    this.event_name = event_name;
  }
}

capable.runtime.register(EventHandler, (_component, { target, event_name }) => {
  if (event_name !== "submit") throw new Error("Only submit is supported");
  return new Promise((resolve) => {
    target.addEventListener(event_name, (e) => {
      e.preventDefault();
      resolve(Object.fromEntries(new FormData(e.target)));
    });
  });
});

export default {
  submit(form) {
    return new EventHandler(form, "submit");
  },
};
