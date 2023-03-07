import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import {
  ViewLeaderboardFunctionDefinition,
} from "../functions/view_leaderboard.ts";

// TODO: Modify workflow to support link trigger

const ViewLeaderboardWorkflow = DefineWorkflow({
  callback_id: "view_leaderboard_workflow",
  title: "View leaderboard",
  input_parameters: {
    properties: {
      channelId: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["channelId"],
  },
});

const leaderboardMessage = ViewLeaderboardWorkflow.addStep(
  ViewLeaderboardFunctionDefinition,
  {},
);

ViewLeaderboardWorkflow.addStep(
  Schema.slack.functions.SendMessage,
  {
    channel_id: ViewLeaderboardWorkflow.inputs.channelId,
    message: leaderboardMessage.outputs.leaderboardMessage,
  },
);

export default ViewLeaderboardWorkflow;
