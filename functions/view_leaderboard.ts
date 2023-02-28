import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { getLeaderboardData } from "../datastores/leaderboard_datastore.ts";
import { ReactionLeaderboardEntry } from "../domain/leaderboard.ts";

export const ViewLeaderboardFunction = DefineFunction({
  callback_id: "view_leaderboard",
  title: "View Top Emojis Leaderboard",
  description: "Gets all emoji data from datastore",
  source_file: "functions/view_leaderboard.ts",
  output_parameters: {
    properties: {
      leaderboardMessage: {
        type: Schema.slack.types.rich_text,
        description: "Message describing current leaderboard",
      },
    },
    required: ["leaderboardMessage"],
  },
});

export default SlackFunction(
  ViewLeaderboardFunction,
  async ({ client }) => {
    const leaderboardData = await getLeaderboardData(client);
    console.log("leaderboardData", leaderboardData);
    if (leaderboardData.length === 0) {
      return {
        outputs: { leaderboardMessage: "Add some emojis to your channel!" },
      };
    }
    let leaderboardMessage = "";
    for (let i = 0; i < leaderboardData.length; ++i) {
      const item = leaderboardData[i];
      leaderboardMessage += `${i + 1}. :${item.reaction}: was used ${
        item.count === 1 ? "1 time" : `${item.count} times`
      }\n`;
    }
    console.log("testinggggg leaderboardMessage", leaderboardMessage);
    return { outputs: { leaderboardMessage } };
  },
);
