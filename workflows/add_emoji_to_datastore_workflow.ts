import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import {
  AddEmojiToDatastoreFunctionDefinition,
} from "../functions/add_emoji_to_datastore.ts";

const AddEmojiToDatastoreWorkflow = DefineWorkflow({
  callback_id: "add_emoji_to_datastore_workflow",
  title: "Add emoji to datastore",
  description: "Adds emoji to datastore on react",
  input_parameters: {
    properties: {
      emoji: {
        type: Schema.types.string,
        description: "emoji used as react",
      },
    },
    required: ["emoji"],
  },
});

AddEmojiToDatastoreWorkflow.addStep(
  AddEmojiToDatastoreFunctionDefinition,
  {
    emoji: AddEmojiToDatastoreWorkflow.inputs.emoji,
  },
);

export default AddEmojiToDatastoreWorkflow;
