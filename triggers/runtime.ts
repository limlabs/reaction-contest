import HandleReactionWorkflow from "../workflows/handle_reaction_workflow.ts";
import { handleReactionInputsBase } from "../core/schemas.ts";
import { PopulatedArray } from "https://deno.land/x/deno_slack_api@1.7.0/type-helpers.ts";
import {
  SlackAPIClient,
  Trigger,
} from "https://deno.land/x/deno_slack_api@1.5.0/types.ts";
import { ReactionEventType } from "../domain/reaction.ts";
import UpdateLeaderboardWorkflow from "../workflows/update_leaderboard_workflow.ts";
import ViewLeaderboardWorkflow from "../workflows/view_leaderboard_workflow.ts";

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

const makeViewLeaderboardTriggerParams = (
  newChannels: string[],
): Trigger<typeof ViewLeaderboardWorkflow.definition> => {
  return {
    name: "View Leaderboard",
    workflow: `#/workflows/view_leaderboard_workflow`,
    type: "event",
    inputs: {
      channelId: {
        value: "{{data.channel_id}}",
      },
    },
    event: {
      event_type: "slack#/events/app_mentioned",
      channel_ids: newChannels as PopulatedArray<string>,
    },
  };
};

const makeLeaderboardUpdateScheduledTriggerParams = (): Trigger<
  typeof UpdateLeaderboardWorkflow.definition
> => {
  return {
    name: "Leaderboard Update Scheduled",
    workflow: `#/workflows/update_leaderboard_workflow`,
    type: "scheduled",
    schedule: {
      frequency: {
        type: "hourly",
      },
      start_time: new Date(Date.now() + 1000 * 5).toISOString(),
    },
  };
};

export const createReactionEventTrigger = async (
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

export const updateReactionEventTrigger = async (
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

  console.log(
    `reaction_${action} trigger updated with id`,
    updateTriggerResponse.trigger.id,
  );

  return updateTriggerResponse;
};

export const createViewLeaderboardEventTrigger = async (
  client: SlackAPIClient,
  newChannels: string[],
) => {
  const response = await client.workflows.triggers.create(
    makeViewLeaderboardTriggerParams(newChannels),
  );

  if (!response.ok) {
    throw new Error(
      `failed to create view_leaderboard trigger: ${response.error}`,
    );
  }

  console.log(
    `view_leaderboard trigger created with id`,
    response.trigger.id,
  );

  return response;
};

export const updateViewLoaderboardEventTrigger = async (
  client: SlackAPIClient,
  triggerId: string,
  newChannels: string[],
) => {
  const response = await client.workflows.triggers.update({
    ...makeViewLeaderboardTriggerParams(newChannels),
    trigger_id: triggerId,
  });

  if (!response.ok) {
    throw new Error(
      `failed to create view_leaderboard trigger: ${response.error}`,
    );
  }

  console.log(
    `view_leaderboard trigger updated with id`,
    response.trigger.id,
  );

  return response;
};

export const createLeaderboardUpdateScheduledTrigger = async (
  client: SlackAPIClient,
) => {
  const response = await client.workflows.triggers.create(
    makeLeaderboardUpdateScheduledTriggerParams(),
  );

  if (!response.ok) {
    throw new Error(
      `failed to create leaderboard_udpate_scheduled Trigger: ${response.error}`,
    );
  }

  console.log(
    `leaderboard_udpate_scheduled trigger created with id`,
    response.trigger.id,
  );

  return response;
};

export const updateLeaderboardUpdateScheduledTrigger = async (
  client: SlackAPIClient,
  triggerId: string,
) => {
  const response = await client.workflows.triggers.update({
    ...makeLeaderboardUpdateScheduledTriggerParams(),
    trigger_id: triggerId,
  });

  if (!response.ok) {
    throw new Error(
      `failed to create leaderboard_udpate_scheduled Trigger: ${response.error}`,
    );
  }

  console.log(
    `leaderboard_udpate_scheduled trigger updated with id`,
    response.trigger.id,
  );

  return response;
};

export const deleteTrigger = async (
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
