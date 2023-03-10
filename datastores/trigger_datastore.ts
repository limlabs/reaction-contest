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
    channels: { type: Schema.types.string }, // JSON of array of channels for trigger
    add_reaction_trigger_id: { type: Schema.types.string },
    remove_reaction_trigger_id: { type: Schema.types.string },
  },
};

export const TriggerDatastore = DefineDatastore(TriggerDatastoreSchema);

export const TriggerDatastoreResponseType = DefineType({
  title: "TriggerDatastore response",
  description: "Data from the TriggerDatastore",
  name: "trigger_datastore_data",
  type: Schema.types.object,
  properties: {
    channels: { type: Schema.types.string },
    add_reaction_trigger_id: { type: Schema.types.string },
    remove_reaction_trigger_id: { type: Schema.types.string },
  },
});

export const GetTriggerDataFunctionDefinition = DefineFunction({
  callback_id: "get_trigger_data",
  title: "Get data from trigger datastore",
  source_file: "datastores/trigger_datastore.ts",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
    },
    required: ["interactivity"],
  },
  output_parameters: {
    properties: {
      data: {
        type: TriggerDatastoreResponseType,
        description: "contents of TriggerDatastore",
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["data", "interactivity"],
  },
});

const GetTriggerDataFunction = SlackFunction(
  GetTriggerDataFunctionDefinition,
  async ({ client, inputs }) => {
    const response = await client.apps.datastore.query({
      datastore: TriggerDatastoreName,
    });
    if (!response.ok) {
      throw new Error(
        `failed to get trigger data from datastore: ${response.error}`,
      );
    }

    if (response.items.length === 0) {
      response.items.push({
        channels: "",
        add_reaction_trigger_id: "",
        remove_reaction_trigger_id: "",
      });
    }

    return {
      outputs: {
        data: response.items[0],
        interactivity: inputs.interactivity,
      },
    };
  },
);

export default GetTriggerDataFunction;
