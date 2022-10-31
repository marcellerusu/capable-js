import * as capable from "../index.js";
export class FormSubmission {
  form: HTMLFormElement;
  constructor(target: HTMLFormElement) {
    this.form = target;
  }
  [capable.runtime.EffectEquals](other: FormSubmission) {
    return this.form === other.form;
  }
}

capable.runtime.register(FormSubmission, (_component, { form }) => {
  return new Promise((resolve) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      resolve(Object.fromEntries(new FormData(form)));
    });
  });
});

let form_utils = {
  on_submit(form: HTMLFormElement) {
    return new FormSubmission(form);
  },
};

export default form_utils;
