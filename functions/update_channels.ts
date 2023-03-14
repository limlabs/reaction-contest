import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  saveActiveChannels,
  TriggerDatastoreName,
} from "../datastores/trigger_datastore.ts";
import HandleReactionWorkflow from "../workflows/handle_reaction_workflow.ts";
import { handleReactionInputsBase } from "../core/schemas.ts";
import { PopulatedArray } from "https://deno.land/x/deno_slack_api@1.7.0/type-helpers.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.5.0/types.ts";
import { ReactionEventType } from "../domain/reaction.ts";
import { FunctionHandlerReturnArgs } from "https://deno.land/x/deno_slack_sdk@1.6.0/functions/types.ts";

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

const CreateReactionEventTrigger = async (
  client: SlackAPIClient,
  newChannels: string[],
  action: ReactionEventType,
) => {
  const createTriggerResponse = await client.workflows.triggers.create<
    typeof HandleReactionWorkflow.definition
  >({
    type: "event",
    name: action === "added" ? "ReactionAdded" : "ReactionRemoved",
    description: `Handles when user ${
      action === "added" ? "adds" : "removes"
    } reaction in channel`,
    workflow: "#/workflows/handle_reaction_workflow",
    event: {
      event_type: `slack#/events/reaction_${action}`,
      channel_ids: newChannels as PopulatedArray<string>,
    },
    inputs: {
      ...handleReactionInputsBase,
      action: { value: action },
    },
  });

  if (!createTriggerResponse.ok) {
    throw new Error(
      `failed to create Reaction${
        action === "added" ? "Added" : "Removed"
      }Trigger: ${createTriggerResponse.error}`,
    );
  }

  console.log(
    `reaction_${action} trigger created with id`,
    createTriggerResponse.trigger.id,
  );

  return createTriggerResponse;
};

const UpdateReactionEventTrigger = async (
  client: SlackAPIClient,
  newChannels: string[],
  triggerId: string,
  action: ReactionEventType,
) => {
  const updateTriggerResponse = await client.workflows.triggers.update<
    typeof HandleReactionWorkflow.definition
  >(
    {
      trigger_id: triggerId,
      type: "event",
      name: action === "added" ? "ReactionAdded" : "ReactionRemoved",
      description: `Handles when user ${
        action === "added" ? "adds" : "removes"
      } reaction in channel`,
      workflow: "#/workflows/handle_reaction_workflow",
      event: {
        event_type: `slack#/events/reaction_${action}`,
        channel_ids: newChannels as PopulatedArray<string>,
      },
      inputs: {
        ...handleReactionInputsBase,
        action: { value: action },
      },
    },
  );

  if (!updateTriggerResponse.ok) {
    throw new Error(
      `failed to update Reaction${
        action === "added" ? "Added" : "Removed"
      }Trigger: ${updateTriggerResponse.error}`,
    );
  }

  return updateTriggerResponse;
};

// const DeleteTrigger = async (
//   client: SlackAPIClient,
//   triggerId: string,
// ) => {
//   const response = await client.workflows.triggers.delete({
//     trigger_id: triggerId,
//   });

//   if (!response.ok) {
//     throw new Error(
//       `failed to delete trigger: ${response.error}`,
//     );
//   }

//   console.log(`Trigger ${triggerId} deleted`);

//   return response;
// };

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
          CreateReactionEventTrigger(client, inputs.newChannels, "added"),
          CreateReactionEventTrigger(client, inputs.newChannels, "removed"),
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
          UpdateReactionEventTrigger(
            client,
            inputs.newChannels,
            addReactionTriggerID,
            "added",
          ),
          UpdateReactionEventTrigger(
            client,
            inputs.newChannels,
            removeReactionTriggerId,
            "removed",
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

      return { outputs: {} } as FunctionHandlerReturnArgs;
    }
  },
);

export default UpdateChannelsFunction;
