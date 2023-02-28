import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";
import { saveLeaderboard } from "../datastores/leaderboard_datastore.ts";
import { getReactionsSince } from "../datastores/reaction_datastore.ts";
import {
  createReactionLeaderboard,
  topReactions,
} from "../domain/leaderboard.ts";

export const UpdateLeaderboardFunction = DefineFunction({
  callback_id: "update_leaderboard",
  title: "Updates a leaderboard object",
  source_file: "functions/update_leaderboard.ts",
});

// TODO:
// 1. Fetch previous since value
export default SlackFunction(
  UpdateLeaderboardFunction,
  async ({ client }) => {
    console.log("updating leaderboard");
    const since = 0;
    const events = await getReactionsSince(client, since);
    console.log("events since", events);
    const leaderboardData = topReactions(events);
    const leaderboard = createReactionLeaderboard("top", leaderboardData);
    await saveLeaderboard(client, leaderboard);
    console.log('updated "top" leaderboard');
    console.log(leaderboardData);

    return { outputs: {} };
  },
);
