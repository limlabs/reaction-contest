import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { appPrefix } from "../core/config.ts";

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
