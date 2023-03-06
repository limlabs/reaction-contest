import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { HandleReactionFunctionDefinition } from "../functions/handle_reaction.ts";

const HandleReactionWorkflow = DefineWorkflow({
  callback_id: "handle_reaction_workflow",
  title: "Add emoji to datastore",
  description: "Adds emoji to datastore on react",
  input_parameters: {
    properties: {
      reaction: {
        type: Schema.types.string,
      },
      userId: {
        type: Schema.types.string,
      },
      channelId: {
        type: Schema.types.string,
      },
      action: {
        type: Schema.types.string,
        enum: ["added", "removed"],
      },
    },
    required: ["reaction", "channelId", "userId", "action"],
  },
});

HandleReactionWorkflow.addStep(
  HandleReactionFunctionDefinition,
  {
    reaction: HandleReactionWorkflow.inputs.reaction,
    channelId: HandleReactionWorkflow.inputs.channelId,
    userId: HandleReactionWorkflow.inputs.userId,
    action: HandleReactionWorkflow.inputs.action,
  },
);

export default HandleReactionWorkflow;
