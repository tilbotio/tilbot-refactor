import { expect, test } from "vitest";
import { LocalProjectController } from "../../../frontend/src/client/controllers/localproject";

const testproject: string =
  '{"current_block_id":3,"blocks":{"1":{"type":"Auto","name":"Block 1","content":"This is a small test","x":680,"y":180,"connectors":[{"type":"Basic","targets":[]}],"chatgpt_variation":false,"variation_prompt":"Please generate a variation of the message the user sends, while preserving its original meaning. Try to be somewhat concise."},"2":{"type":"Auto","name":"Block 2","content":"Hello","x":280,"y":120,"connectors":[{"type":"Basic","targets":[1]}],"chatgpt_variation":false,"variation_prompt":"Please generate a variation of the message the user sends, while preserving its original meaning. Try to be somewhat concise."}},"starting_block_id":2,"canvas_width":2880,"canvas_height":1620,"bot_name":"Tilbot","variables":[],"settings":{"project_name":"New project"}}';

const projectcontroller: LocalProjectController = new LocalProjectController(
  testproject,
  () => {},
  () => {},
  () => {}
);

test("Check input replacement", () => {
  expect(
    projectcontroller.check_variables(
      "Nice to talk to you, [input]!",
      "username"
    )
  ).toBe("Nice to talk to you, username!");
});
