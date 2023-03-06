import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";
import { getReactionsSince } from "../functions/handle_reaction.ts";
import {
  createReactionLeaderboard,
  ReactionLeaderboard,
  topReactions,
} from "../domain/leaderboard.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.7.0/types.ts";
import { LeaderboardDatastoreName } from "../datastores/leaderboard_datastore.ts";

export const UpdateLeaderboardFunctionDefinition = DefineFunction({
  callback_id: "update_leaderboard",
  title: "Updates a leaderboard object",
  source_file: "functions/update_leaderboard.ts",
});

const UpdateLeaderboardFunction = SlackFunction(
  UpdateLeaderboardFunctionDefinition,
  async ({ client }) => {
    console.log("updating leaderboard");
    const { last_updated_timestamp, data } = await getLeaderboardInfo(client);
    const events = await getReactionsSince(client, last_updated_timestamp);
    console.log("events since", events);
    const leaderboardData = topReactions(events, data);
    const leaderboard = createReactionLeaderboard("top", leaderboardData);
    console.log("LEADERBOARD", leaderboard);
    await saveLeaderboard(client, leaderboard);
    console.log('updated "top" leaderboard');
    console.log(leaderboardData);

    return { outputs: {} };
  },
);

export const saveLeaderboard = async (
  client: SlackAPIClient,
  leaderboard: ReactionLeaderboard,
) => {
  const response = await client.apps.datastore.put({
    datastore: LeaderboardDatastoreName,
    item: {
      ...leaderboard,
      data: JSON.stringify(leaderboard.data),
      last_updated_timestamp: leaderboard.last_updated,
    },
  });

  if (!response.ok) {
    throw new Error(
      `failed to get reactions from datastore: ${response.error}`,
    );
  }
};

// export const getLastUpdated = async (
//   client: SlackAPIClient,
// ) => {
//   const response = await client.apps.datastore.query({
//     datastore: LeaderboardDatastoreName,
//   });

//   if (!response.ok) {
//     throw new Error(
//       `failed to get leaderboard from datastore: ${response.error}`,
//     );
//   }

//   if (response.items.length === 0) {
//     return Date.now();
//   }
//   return response.items[0].last_updated_timestamp;
// };

export const getLeaderboardInfo = async (
  client: SlackAPIClient,
) => {
  const response = await client.apps.datastore.query({
    datastore: LeaderboardDatastoreName,
  });

  if (!response.ok) {
    throw new Error(
      `failed to get leaderboard from datastore: ${response.error}`,
    );
  }

  if (response.items.length === 0) {
    console.log("response.items.length === 0");
    return {
      data: [],
      last_updated_timestamp: Date.now(),
    };
  }
  console.log("response.items[0]", response.items[0]);
  return {
    ...response.items[0],
    data: JSON.parse(response.items[0].data),
  } as any;
  // {
  //   data: { reaction: string; count: number }[];
  //   last_updated_timestamp: number;
  // };
};

export default UpdateLeaderboardFunction;
