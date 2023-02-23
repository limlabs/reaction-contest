import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { HandleReactionFunction } from "../functions/handle_reaction.ts";
import { UpdateLeaderboardFunction } from "../functions/update_leaderboard.ts";
import UpdateLeaderboardWorkflow from "./update_leaderboard_workflow.ts";

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
  HandleReactionFunction,
  {
    reaction: HandleReactionWorkflow.inputs.reaction,
    channelId: HandleReactionWorkflow.inputs.channelId,
    userId: HandleReactionWorkflow.inputs.userId,
    action: HandleReactionWorkflow.inputs.action,
  },
);

HandleReactionWorkflow.addStep(
  UpdateLeaderboardFunction,
  {},
);

export default HandleReactionWorkflow;
