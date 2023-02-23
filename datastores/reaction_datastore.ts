import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.5.0/types.ts";
import { appPrefix } from "../core/config.ts";
import { ReactionEvent } from "../domain/reaction.ts";

export const ReactionDatastoreName = `${appPrefix}-reactions`;

export const ReactionDatastoreSchema = {
  name: ReactionDatastoreName,
  primary_key: "id" as const,
  attributes: {
    id: { type: Schema.types.string }, // store the original reaction id
    action: { type: Schema.types.string }, // either 'added' or 'removed'
    shortcode: { type: Schema.types.string }, // such as :cheers:
    timestamp: { type: Schema.types.integer }, // the time the event happened (slack format, from event payload )
    userId: { type: Schema.types.string }, // id of the user who reacted
    channelId: { type: Schema.types.string }, // channel the reaction happened in
  },
};

export const ReactionDatastore = DefineDatastore(ReactionDatastoreSchema);

export const saveReaction = async (
  client: SlackAPIClient,
  reaction: ReactionEvent,
) => {
  const response = await client.apps.datastore.put({
    datastore: ReactionDatastoreName,
    item: reaction,
  });

  if (!response.ok) {
    throw new Error(
      `failed to get reactions from datastore: ${response.error}`,
    );
  }
};

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
