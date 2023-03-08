import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.5.0/types.ts";
import { appPrefix } from "../core/config.ts";

export const TriggerDatastoreName = `${appPrefix}-triggers`;

export const TriggerDatastoreSchema = {
  name: TriggerDatastoreName,
  primary_key: "add_reaction_trigger_id" as const,
  attributes: {
    channels: { type: Schema.types.string }, // JSON of array of channels for trigger
    add_reaction_trigger_id: { type: Schema.types.string },
    remove_reaction_trigger_id: { type: Schema.types.string },
  },
};

export const TriggerDatastore = DefineDatastore(TriggerDatastoreSchema);

export const getTriggerData = async (
  client: SlackAPIClient,
) => {
  const response = await client.apps.datastore.query({
    datastore: TriggerDatastoreName,
  });

  if (!response.ok) {
    throw new Error(
      `failed to get trigger data from datastore: ${response.error}`,
    );
  }

  return response.items;
};
