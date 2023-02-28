import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.7.0/types.ts";
import { saveLeaderboard } from "../datastores/leaderboard_datastore.ts";
import {
  ReactionDatastoreName,
  ReactionDatastoreSchema,
} from "../datastores/reaction_datastore.ts";
import {
  createReactionLeaderboard,
  topReactions,
} from "../domain/leaderboard.ts";
import { ReactionEvent } from "../domain/reaction.ts";

// TODO: Ensure we return as many results as possible (for now)
// Eventually we will need to handle pagination.
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
