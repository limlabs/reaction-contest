import HandleReactionWorkflow from "../workflows/handle_reaction_workflow.ts";
import { handleReactionInputsBase } from "../core/schemas.ts";
import { PopulatedArray } from "https://deno.land/x/deno_slack_api@1.7.0/type-helpers.ts";
import {
  SlackAPIClient,
  Trigger,
} from "https://deno.land/x/deno_slack_api@1.5.0/types.ts";
import { ReactionEventType } from "../domain/reaction.ts";
import AppMentionedWorkflow from "../workflows/app_mentioned_workflow.ts";
import UpdateLeaderboardWorkflow from "../workflows/update_leaderboard_workflow.ts";

const makeReactionTriggerParams = (
  newChannels: string[],
  action: ReactionEventType,
): Trigger<typeof HandleReactionWorkflow.definition> => {
  return {
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
  };
};

export const CreateReactionEventTrigger = async (
  client: SlackAPIClient,
  newChannels: string[],
  action: ReactionEventType,
) => {
  const createTriggerResponse = await client.workflows.triggers.create<
    typeof HandleReactionWorkflow.definition
  >(makeReactionTriggerParams(newChannels, action));

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
  triggerId: string,
  newChannels: string[],
  action: ReactionEventType,
) => {
  const updateTriggerResponse = await client.workflows.triggers.update<
    typeof HandleReactionWorkflow.definition
  >(
    {
      ...makeReactionTriggerParams(newChannels, action),
      trigger_id: triggerId,
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

export const CreateAppMentionedEventTrigger = async (
  client: SlackAPIClient,
  newChannels: string[],
) => {
  const response = await client.workflows.triggers.create<
    typeof AppMentionedWorkflow.definition
  >({
    name: "App Mentioned",
    workflow: `#/workflows/app_mentioned`,
    type: "event",
    event: {
      event_type: "slack#/events/app_mentioned",
      channel_ids: newChannels as PopulatedArray<string>,
    },
  });

  if (!response.ok) {
    throw new Error(
      `failed to create App Mentioned Trigger: ${response.error}`,
    );
  }

  console.log(
    `App Mentioned trigger created with id`,
    response.trigger.id,
  );

  return response;
};

export const UpdateAppMentionedEventTrigger = async (
  client: SlackAPIClient,
  triggerId: string,
  newChannels: string[],
) => {
  const response = await client.workflows.triggers.update<
    typeof AppMentionedWorkflow.definition
  >({
    trigger_id: triggerId,
    name: "App Mentioned",
    workflow: `#/workflows/app_mentioned`,
    type: "event",
    event: {
      event_type: "slack#/events/app_mentioned",
      channel_ids: newChannels as PopulatedArray<string>,
    },
  });

  if (!response.ok) {
    throw new Error(
      `failed to create App Mentioned Trigger: ${response.error}`,
    );
  }

  console.log(
    `App Mentioned trigger created with id`,
    response.trigger.id,
  );

  return response;
};

export const CreateLeaderboardUpdateScheduledTrigger = async (
  client: SlackAPIClient,
) => {
  const response = await client.workflows.triggers.create<
    typeof UpdateLeaderboardWorkflow.definition
  >({
    name: "Leaderboard Update Scheduled",
    workflow: `#/workflows/update_leaderboard_workflow`,
    type: "scheduled",
    schedule: {
      frequency: {
        type: "hourly",
      },
      start_time: new Date(Date.now() + 1000 * 5).toISOString(),
    },
  });

  if (!response.ok) {
    throw new Error(
      `failed to create App Mentioned Trigger: ${response.error}`,
    );
  }

  console.log(
    `App Mentioned trigger created with id`,
    response.trigger.id,
  );

  return response;
};

export const UpdateLeaderboardUpdateScheduledTrigger = async (
  client: SlackAPIClient,
  triggerId: string,
) => {
  const response = await client.workflows.triggers.update<
    typeof UpdateLeaderboardWorkflow.definition
  >({
    name: "Leaderboard Update Scheduled",
    workflow: `#/workflows/update_leaderboard_workflow`,
    type: "scheduled",
    schedule: {
      frequency: {
        type: "hourly",
      },
      start_time: new Date(Date.now() + 1000 * 5).toISOString(),
    },
    trigger_id: triggerId,
  });
  if (!response.ok) {
    throw new Error(
      `failed to create App Mentioned Trigger: ${response.error}`,
    );
  }

  console.log(
    `App Mentioned trigger created with id`,
    response.trigger.id,
  );

  return response;
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
