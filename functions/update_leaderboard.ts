import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  createReactionLeaderboard,
  ReactionLeaderboard,
  topReactions,
} from "../domain/leaderboard.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.7.0/types.ts";
import { LeaderboardDatastoreName } from "../datastores/leaderboard_datastore.ts";
import {
  ReactionDatastoreName,
  ReactionDatastoreSchema,
} from "../datastores/reaction_datastore.ts";
import { ReactionEvent } from "../domain/reaction.ts";

export const UpdateLeaderboardFunctionDefinition = DefineFunction({
  callback_id: "update_leaderboard",
  title: "Updates a leaderboard object",
  source_file: "functions/update_leaderboard.ts",
});

const UpdateLeaderboardFunction = SlackFunction(
  UpdateLeaderboardFunctionDefinition,
  async ({ client }) => {
    console.log("updating leaderboard");
    const since = await getLastUpdated(client);
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

export const getLastUpdated = async (
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
    return Date.now();
  }
  return response.items[0].last_updated_timestamp;
};

export const getLeaderboardData = async (
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
    return [];
  }
  return JSON.parse(response.items[0].data);
};

export const getReactionsSince = async (
  client: SlackAPIClient,
  since: number,
) => {
  const response = await client.apps.datastore.query<
    typeof ReactionDatastoreSchema
  >({
    datastore: ReactionDatastoreName,
    expression: "#timestamp > :last_updated",
    expression_attributes: { "#timestamp": "timestamp" },
    expression_values: { ":last_updated": since },
    limit: 1000,
  });

  if (!response.ok) {
    throw new Error(
      `failed to get reactions from datastore: ${response.error}`,
    );
  }

  return response.items.map((item) => item as ReactionEvent);
};

export default UpdateLeaderboardFunction;
