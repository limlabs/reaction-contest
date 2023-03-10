import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.7.0/types.ts";

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

export const saveActiveChannels = async (
  client: SlackAPIClient,
  item: {
    channels: string[];
    add_reaction_trigger_id: string;
    remove_reaction_trigger_id: string;
  },
) => {
  const response = await client.apps.datastore.put({
    datastore: TriggerDatastoreName,
    item,
  });
  if (!response.ok) {
    throw new Error(
      `failed to update active trigger datastore: ${response.error}`,
    );
  }
  return response;
};

export const TriggerDatastore = DefineDatastore(TriggerDatastoreSchema);
