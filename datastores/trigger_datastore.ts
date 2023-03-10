import {
  DefineDatastore,
  DefineFunction,
  DefineType,
  Schema,
  SlackFunction,
} from "deno-slack-sdk/mod.ts";

import { appPrefix } from "../core/config.ts";
export const TriggerDatastoreName = `${appPrefix}-triggers`;

export const TriggerDatastoreSchema = {
  name: TriggerDatastoreName,
  primary_key: "add_reaction_trigger_id" as const,
  attributes: {
    channels: {
      type: Schema.types.array,
      items: { type: Schema.slack.types.channel_id },
    },
    add_reaction_trigger_id: { type: Schema.types.string },
    remove_reaction_trigger_id: { type: Schema.types.string },
  },
};

export const TriggerDatastore = DefineDatastore(TriggerDatastoreSchema);
