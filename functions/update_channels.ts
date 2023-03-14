import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  saveActiveChannels,
  TriggerDatastoreName,
} from "../datastores/trigger_datastore.ts";
import { FunctionHandlerReturnArgs } from "https://deno.land/x/deno_slack_sdk@1.6.0/functions/types.ts";
import {
  CreateReactionEventTrigger,
  UpdateReactionEventTrigger,
} from "./runtime_event_trigger_functions.ts";

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
    const triggerDatastoreResponse = await client.apps.datastore.query({
      datastore: TriggerDatastoreName,
    });

    if (!triggerDatastoreResponse.ok) {
      throw new Error(
        `failed to get trigger data from datastore: ${triggerDatastoreResponse.error}`,
      );
    }

    if (triggerDatastoreResponse.items.length === 0) { // no triggers in datastore
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
      const addReactionTriggerID =
        triggerDatastoreResponse.items[0].add_reaction_trigger_id;
      const removeReactionTriggerId =
        triggerDatastoreResponse.items[0].remove_reaction_trigger_id;

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
