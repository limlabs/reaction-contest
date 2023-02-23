import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  getLastUpdated,
  getLeaderboardData,
  saveLeaderboard,
} from "../datastores/leaderboard_datastore.ts";
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
    const since = await getLastUpdated(client);
    // const since = 0;
    const events = await getReactionsSince(client, since);
    console.log("events since", events);
    const oldLeaderboardArr = await getLeaderboardData(client);
    const leaderboardData = topReactions(events, oldLeaderboardArr);
    const leaderboard = createReactionLeaderboard("top", leaderboardData);
    console.log("LEADERBOARD", leaderboard);
    await saveLeaderboard(client, leaderboard);
    console.log('updated "top" leaderboard');
    console.log(leaderboardData);

    return { outputs: {} };
  },
);
