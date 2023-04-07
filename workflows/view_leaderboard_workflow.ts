import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { UpdateLeaderboardFunctionDefinition } from "../functions/update_leaderboard.ts";
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

ViewLeaderboardWorkflow.addStep(
  Schema.slack.functions.SendMessage,
  {
    channel_id: ViewLeaderboardWorkflow.inputs.channelId,
    message: "C r o n c h ing the latest stats, one moment please...",
  },
);

ViewLeaderboardWorkflow.addStep(
  UpdateLeaderboardFunctionDefinition,
  {},
);

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
