import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  saveActiveChannels,
  TriggerDatastoreName,
} from "../datastores/trigger_datastore.ts";
import HandleReactionWorkflow from "../workflows/handle_reaction_workflow.ts";
import { handleReactionInputsBase } from "../core/schemas.ts";
import { PopulatedArray } from "https://deno.land/x/deno_slack_api@1.7.0/type-helpers.ts";

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
    console.log("response", response);
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
            channel_ids: inputs.newChannels as PopulatedArray<string>,
          },
          inputs: {
            ...handleReactionInputsBase,
            action: { value: "added" },
          },
        });
        if (!addTriggerResponse.ok) {
          throw new Error(
            `failed to create ReactionAddedTrigger: ${response.error}`,
          );
        }
        console.log("addTriggerResponse", addTriggerResponse.trigger.id);
        const removeTriggerResponse = await client.workflows.triggers.create<
          typeof HandleReactionWorkflow.definition
        >(
          {
            type: "event",
            name: "ReactionRemoved",
            description: "Handles when user removes reaction in channel",
            workflow: "#/workflows/handle_reaction_workflow",
            event: {
              event_type: "slack#/events/reaction_removed",
              channel_ids: inputs.newChannels as PopulatedArray<string>,
            },
            inputs: {
              ...handleReactionInputsBase,
              action: { value: "removed" },
            },
          },
        );
        if (!removeTriggerResponse.ok) {
          `failed to create ReactionRemovedTrigger: ${response.error}`;
        }
        console.log("removeTriggerResponse", removeTriggerResponse.trigger.id);
        const saveChannelsResponse = await saveActiveChannels(client, {
          channels: inputs.newChannels,
          add_reaction_trigger_id: addTriggerResponse.trigger.id,
          remove_reaction_trigger_id: removeTriggerResponse.trigger.id,
        });
        console.log("saveChannelResponse", saveChannelsResponse);
        if (saveChannelsResponse.error) {
          throw new Error(
            `new active channels didn't save correctly: ${saveChannelsResponse.error}`,
          );
        }
      }
    } else {
      if (inputs.newChannels.length > 0) {
        const addTriggerResponse = await client.workflows.triggers.update<
          typeof HandleReactionWorkflow.definition
        >(
          {
            trigger_id: response.items[0].add_reaction_trigger_id,
            type: "event",
            name: "ReactionAdded",
            description: "Handles when user adds reaction in channel",
            workflow: "#/workflows/handle_reaction_workflow",
            event: {
              event_type: "slack#/events/reaction_added",
              channel_ids: inputs.newChannels as PopulatedArray<string>,
            },
            inputs: {
              ...handleReactionInputsBase,
              action: { value: "added" },
            },
          },
        );

        if (!addTriggerResponse.ok) {
          throw new Error(
            `failed to update ReactionAddedTrigger: ${response.error}`,
          );
        }

        const removeTriggerResponse = await client.workflows.triggers.update<
          typeof HandleReactionWorkflow.definition
        >(
          {
            trigger_id: response.items[0].remove_reaction_trigger_id,
            type: "event",
            name: "ReactionRemoved",
            description: "Handles when user removes reaction in channel",
            workflow: "#/workflows/handle_reaction_workflow",
            event: {
              event_type: "slack#/events/reaction_removed",
              channel_ids: inputs.newChannels as PopulatedArray<string>,
            },
            inputs: {
              ...handleReactionInputsBase,
              action: { value: "removed" },
            },
          },
        );
        if (!removeTriggerResponse.ok) {
          throw new Error(
            `failed to update ReactionRemovedTrigger: ${response.error}`,
          );
        }
        const saveChannelsResponse = await saveActiveChannels(client, {
          channels: inputs.newChannels,
          add_reaction_trigger_id: addTriggerResponse.trigger.id,
          remove_reaction_trigger_id: removeTriggerResponse.trigger.id,
        });
        console.log("saveChannelResponse", saveChannelsResponse);
      }

      return { outputs: {} };
    }
  },
);

export default UpdateChannelsFunction;
