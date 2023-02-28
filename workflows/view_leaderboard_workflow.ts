import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { ViewLeaderboardFunction } from "../functions/view_leaderboard.ts";

// TODO: Modify workflow to support link trigger

const ViewLeaderboardWorkflow = DefineWorkflow({
  callback_id: "view_leaderboard_workflow",
  title: "View leaderboard",
  input_parameters: {
    properties: {
      userId: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["userId"],
  },
});

// const topTenEmojisArr =
ViewLeaderboardWorkflow.addStep(
  ViewLeaderboardFunction,
  { userId: ViewLeaderboardWorkflow.inputs.userId },
);

// ViewLeaderboardWorkflow.addStep(
//   Schema.slack.functions.SendEphemeralMessage,
//   {
//     channel_id: "C04NSNR0Q6P",
//     user_id: ViewLeaderboardWorkflow.inputs.userId,
//     message: `Top Ten: ${topTenEmojisArr}`,
//   },
// );

export default ViewLeaderboardWorkflow;
