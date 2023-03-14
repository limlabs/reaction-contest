import HandleReactionWorkflow from "../workflows/handle_reaction_workflow.ts";
import { handleReactionInputsBase } from "../core/schemas.ts";
import { PopulatedArray } from "https://deno.land/x/deno_slack_api@1.7.0/type-helpers.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.5.0/types.ts";
import { ReactionEventType } from "../domain/reaction.ts";

export const CreateReactionEventTrigger = async (
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

export const UpdateReactionEventTrigger = async (
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

export const DeleteTrigger = async (
  client: SlackAPIClient,
  triggerId: string,
) => {
  const deleteTriggerResponse = await client.workflows.triggers.delete({
    trigger_id: triggerId,
  });

  if (!deleteTriggerResponse.ok) {
    throw new Error(
      `failed to delete trigger: ${deleteTriggerResponse.error}`,
    );
  }

  console.log(`Trigger ${triggerId} deleted`);

  return deleteTriggerResponse;
};
