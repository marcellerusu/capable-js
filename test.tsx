import * as capable from "./index.js";
import * as html from "./effects/html.js";
import { Accordion, AccordionItem } from "./examples/Accordion.js";
import { on } from "./effects/events.js";

async function* Main() {
  yield* (
    <Accordion children>
      <AccordionItem title="Hey" children>
        yo
      </AccordionItem>
    </Accordion>
  );

  yield on.opened(window);
  yield <div>done</div>;
}

let component = capable.runtime.mount(Main, document.getElementById("a"));
capable.runtime.run(component);
