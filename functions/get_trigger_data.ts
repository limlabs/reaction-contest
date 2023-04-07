import {
  DefineFunction,
  DefineType,
  Schema,
  SlackFunction,
} from "deno-slack-sdk/mod.ts";
import { SettingsDatastoreName } from "../datastores/settings_datastore.ts";

export const TriggerDatastoreResponseType = DefineType({
  title: "TriggerDatastore response",
  description: "Data from the TriggerDatastore",
  name: "settings_datastore_data",
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
  source_file: "functions/get_trigger_data.ts",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
    },
    required: ["interactivity"],
  },
  output_parameters: {
    properties: {
      channels: {
        type: Schema.types.array,
        items: {
          title: "channel",
          description: "channels for reaction events",
          type: Schema.slack.types.channel_id,
        },
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      add_reaction_trigger_id: { type: Schema.types.string },
      remove_reaction_trigger_id: { type: Schema.types.string },
    },
    required: ["channels", "interactivity"],
  },
});

const GetTriggerDataFunction = SlackFunction(
  GetTriggerDataFunctionDefinition,
  async ({ client, inputs }) => {
    const response = await client.apps.datastore.query({
      datastore: SettingsDatastoreName,
    });
    if (!response.ok) {
      throw new Error(
        `failed to get trigger data from datastore: ${response.error}`,
      );
    }

    if (response.items.length === 0) {
      response.items.push({
        channels: [],
        add_reaction_trigger_id: "",
        remove_reaction_trigger_id: "",
      });
    }

    return {
      outputs: {
        channels: response.items[0].channels,
        interactivity: inputs.interactivity,
        add_reaction_trigger_id: response.items[0].add_reaction_trigger_id,
        remove_reaction_trigger_id:
          response.items[0].remove_reaction_trigger_id,
      },
    };
  },
);

export default GetTriggerDataFunction;
