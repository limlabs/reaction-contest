import {
  DefineFunction,
  DefineType,
  Schema,
  SlackFunction,
} from "deno-slack-sdk/mod.ts";
import { TriggerDatastoreName } from "../datastores/trigger_datastore.ts";
import HandleReactionAddedTrigger from "../triggers/reaction_added_trigger.ts";
import HandleReactionRemovedTrigger from "../triggers/reaction_removed_trigger.ts";
import HandleReactionWorkflow from "../workflows/handle_reaction_workflow.ts";
import { handleReactionInputsBase } from "../core/schemas.ts";
import { PopulatedArray } from "https://deno.land/x/deno_slack_api@1.7.0/type-helpers";

export const UpdateChannelsFunctionDefinition = DefineFunction({
  callback_id: "update_channels",
  title: "Creates, updates, or deletes reaction event triggers",
  source_file: "functions/update_channels.ts",
  input_parameters: {
    properties: {
      newChannels: {
        type: Schema.types.array,
        items: {
          title: "new channels",
          description: "new channels for datastore",
          type: Schema.slack.types.channel_id,
        },
      },
    },
    required: [
      "newChannels",
    ],
  },
});

const UpdateChannelsFunction = SlackFunction(
  UpdateChannelsFunctionDefinition,
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
      if (inputs.newChannels.length > 0) {
        const addTriggerResponse = await client.workflows.triggers.create<
          typeof HandleReactionWorkflow.definition
        >({
          type: "event",
          name: "ReactionAdded",
          description: "Handles when user adds reaction in channel",
          workflow: "#/workflows/handle_reaction_workflow",
          event: {
            event_type: "slack#/events/reaction_added",
            channel_ids: inputs.newChannels as PopulatedArray,
          },
          inputs: {
            ...handleReactionInputsBase,
            action: { value: "added" },
          },
        });
        if (!addTriggerResponse.ok) {
          throw new Error(
            `failed to create HandleReactionAddedTrigger: ${response.error}`,
          );
        }
        const removeTriggerResponse = await client.workflows.triggers.create(
          HandleReactionRemovedTrigger,
        );
        if (!removeTriggerResponse.ok) {
          `failed to create HandleReactionRemovedTrigger: ${response.error}`;
        }
      }
    }
    return { outputs: {} };
  },
);

export default UpdateChannelsFunction;
