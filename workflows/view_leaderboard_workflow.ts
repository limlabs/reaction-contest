import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetAllEmojiDataDefinition } from "../functions/get_all_emoji_data.ts";

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

const allEmojis = ViewLeaderboardWorkflow.addStep(
  GetAllEmojiDataDefinition,
  {},
);

export default ViewLeaderboardWorkflow;
