import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";

export const ViewLeaderboardFunction = DefineFunction({
  callback_id: "view_leaderboard",
  title: "View Top Emojis Leaderboard",
  description: "Gets all emoji data from datastore",
  source_file: "functions/view_leaderboard.ts",
});

export default SlackFunction(
  ViewLeaderboardFunction,
  ({ client }) => {
    // TODO:
    // 1. Fetch leaderboard data
    // 2. Post message to channel with list of top 5 emojis and counts
    return { outputs: {} };
  },
);
