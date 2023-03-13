import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  saveActiveChannels,
  TriggerDatastoreName,
} from "../datastores/trigger_datastore.ts";
import HandleReactionWorkflow from "../workflows/handle_reaction_workflow.ts";
import { handleReactionInputsBase } from "../core/schemas.ts";
import { PopulatedArray } from "https://deno.land/x/deno_slack_api@1.7.0/type-helpers.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.5.0/types.ts";

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

const CreateReactionAddedTrigger = async (
  client: SlackAPIClient,
  newChannels: string[],
) => {
  const addTriggerResponse = await client.workflows.triggers.create<
    typeof HandleReactionWorkflow.definition
  >({
    type: "event",
    name: "ReactionAdded",
    description: "Handles when user adds reaction in channel",
    workflow: "#/workflows/handle_reaction_workflow",
    event: {
      event_type: "slack#/events/reaction_added",
      channel_ids: newChannels as PopulatedArray<string>,
    },
    inputs: {
      ...handleReactionInputsBase,
      action: { value: "added" },
    },
  });

  if (!addTriggerResponse.ok) {
    throw new Error(
      `failed to create ReactionAddedTrigger: ${addTriggerResponse.error}`,
    );
  }

  console.log(
    "reaction_added trigger created with id",
    addTriggerResponse.trigger.id,
  );

  return addTriggerResponse;
};

const CreateReactionRemovedTrigger = async (
  client: SlackAPIClient,
  newChannels: string[],
) => {
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
        channel_ids: newChannels as PopulatedArray<string>,
      },
      inputs: {
        ...handleReactionInputsBase,
        action: { value: "removed" },
      },
    },
  );

  if (!removeTriggerResponse.ok) {
    throw new Error(
      `failed to create ReactionRemovedTrigger: ${removeTriggerResponse.error}`,
    );
  }

  console.log(
    "reaction_removed trigger created with id",
    removeTriggerResponse.trigger.id,
  );

  return removeTriggerResponse;
};

const UpdateReactionAddedTrigger = async (
  client: SlackAPIClient,
  newChannels: string[],
  triggerId: string,
) => {
  const addTriggerResponse = await client.workflows.triggers.update<
    typeof HandleReactionWorkflow.definition
  >(
    {
      // trigger_id: response.items[0].add_reaction_trigger_id,
      trigger_id: triggerId,
      type: "event",
      name: "ReactionAdded",
      description: "Handles when user adds reaction in channel",
      workflow: "#/workflows/handle_reaction_workflow",
      event: {
        event_type: "slack#/events/reaction_added",
        channel_ids: newChannels as PopulatedArray<string>,
      },
      inputs: {
        ...handleReactionInputsBase,
        action: { value: "added" },
      },
    },
  );

  if (!addTriggerResponse.ok) {
    throw new Error(
      `failed to update ReactionAddedTrigger: ${addTriggerResponse.error}`,
    );
  }

  return addTriggerResponse;
};

const UpdateReactionRemovedTrigger = async (
  client: SlackAPIClient,
  newChannels: string[],
  triggerId: string,
) => {
  const removeTriggerResponse = await client.workflows.triggers.update<
    typeof HandleReactionWorkflow.definition
  >(
    {
      trigger_id: triggerId,
      type: "event",
      name: "ReactionRemoved",
      description: "Handles when user removes reaction in channel",
      workflow: "#/workflows/handle_reaction_workflow",
      event: {
        event_type: "slack#/events/reaction_removed",
        channel_ids: newChannels as PopulatedArray<string>,
      },
      inputs: {
        ...handleReactionInputsBase,
        action: { value: "removed" },
      },
    },
  );
  if (!removeTriggerResponse.ok) {
    throw new Error(
      `failed to update ReactionRemovedTrigger: ${removeTriggerResponse.error}`,
    );
  }
  return removeTriggerResponse;
};

const DeleteTrigger = async (
  client: SlackAPIClient,
  triggerId: string,
) => {
  const response = await client.workflows.triggers.delete({
    trigger_id: triggerId,
  });

  if (!response.ok) {
    throw new Error(
      `failed to delete trigger: ${response.error}`,
    );
  }

  console.log(`Trigger ${triggerId} deleted`);

  return response;
};

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

    if (response.items.length === 0) { // no triggers in datastore
      if (inputs.newChannels.length > 0) { // user entered triggers to form -> create triggers
        const [addTriggerResponse, removeTriggerResponse] = await Promise.all([
          CreateReactionAddedTrigger(client, inputs.newChannels),
          CreateReactionRemovedTrigger(client, inputs.newChannels),
        ]);
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
    } else { // some triggers in datastore
      const addReactionTriggerID = response.items[0].add_reaction_trigger_id;
      const removeReactionTriggerId =
        response.items[0].remove_reaction_trigger_id;

      if (inputs.newChannels.length > 0) { // user entered triggers to form -> update saved triggers
        const [addTriggerResponse, removeTriggerResponse] = await Promise.all([
          UpdateReactionAddedTrigger(
            client,
            inputs.newChannels,
            addReactionTriggerID,
          ),
          UpdateReactionRemovedTrigger(
            client,
            inputs.newChannels,
            removeReactionTriggerId,
          ),
        ]);
        const saveChannelsResponse = await saveActiveChannels(client, {
          channels: inputs.newChannels,
          add_reaction_trigger_id: addTriggerResponse.trigger.id,
          remove_reaction_trigger_id: removeTriggerResponse.trigger.id,
        });
        console.log("saveChannelResponse", saveChannelsResponse);
      }
      // else { // user entered no triggers -> delete saved triggers
      //   const [addTriggerResponse, removeTriggerResponse] = await Promise.all([
      //     DeleteTrigger(client, addReactionTriggerID),
      //     DeleteTrigger(client, removeReactionTriggerId),
      //   ]);
      //   const datastoreResponse = await client.apps.datastore.delete({
      //     datastore: TriggerDatastoreName,
      //     id: addReactionTriggerID,
      //   });

      //   if (!datastoreResponse.ok) {
      //     throw new Error(
      //       `Trigger datastore data didn't delete properly: ${datastoreResponse.error}`,
      //     );
      //   }
      //   console.log("addTriggerResponse", addTriggerResponse);
      // }

      return { outputs: {} };
    }
  },
);

export default UpdateChannelsFunction;
