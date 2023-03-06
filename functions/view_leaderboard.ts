import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { getLeaderboardData } from "./update_leaderboard.ts";

export const ViewLeaderboardFunctionDefinition = DefineFunction({
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
  ViewLeaderboardFunctionDefinition,
  async ({ client }) => {
    const leaderboardData = await getLeaderboardData(client);
    if (leaderboardData.length === 0) {
      return {
        outputs: { leaderboardMessage: "Add some emojis to your channel!" },
      };
    }
    let leaderboardMessage = "*Emoji Contest Leaderboard*\n";
    for (let i = 0; i < leaderboardData.length; ++i) {
      const item = leaderboardData[i];
      leaderboardMessage += `${i + 1}. :${item.reaction}: was used ${
        item.count === 1 ? "1 time" : `${item.count} times`
      }\n`;
    }
    return { outputs: { leaderboardMessage } };
  },
);
