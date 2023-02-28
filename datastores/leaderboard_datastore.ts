import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.5.0/types.ts";
import { appPrefix } from "../core/config.ts";
import { ReactionLeaderboard } from "../domain/leaderboard.ts";

export const LeaderboardDatastoreName = `${appPrefix}-leaderboard`;

export const LeaderboardDatastore = DefineDatastore({
  name: LeaderboardDatastoreName,
  primary_key: "name",
  attributes: {
    name: { type: Schema.types.string }, // store the original reaction id
    last_updated_timestamp: { type: Schema.types.integer }, // store the last time the leaderboard was updated
    data: { type: Schema.types.string }, // stored as a string to keep the type flexible
  },
});

// TODO: save new updated time
export const saveLeaderboard = async (
  client: SlackAPIClient,
  leaderboard: ReactionLeaderboard,
) => {
  const response = await client.apps.datastore.put({
    datastore: LeaderboardDatastoreName,
    item: {
      ...leaderboard,
      data: JSON.stringify(leaderboard.data),
    },
  });

  if (!response.ok) {
    throw new Error(
      `failed to get reactions from datastore: ${response.error}`,
    );
  }
};
