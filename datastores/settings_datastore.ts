import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

import { appPrefix } from "../core/config.ts";
export const SettingsDatastoreName = `${appPrefix}-settings`;

export const CurrentSettingsVersion = "v1";

export const SettingsDatastoreSchema = {
  name: SettingsDatastoreName,
  primary_key: "version" as const,
  attributes: {
    version: { type: Schema.types.string },
    reaction_added_trigger_id: { type: Schema.types.string },
    reaction_removed_trigger_id: { type: Schema.types.string },
    app_mentioned_trigger_id: { type: Schema.types.string },
    leaderboard_update_scheduled_trigger_id: { type: Schema.types.string },
    trigger_channel_ids: {
      type: Schema.types.array,
      items: { type: Schema.slack.types.channel_id },
    },
  },
};

export const SettingsDatastore = DefineDatastore(SettingsDatastoreSchema);
