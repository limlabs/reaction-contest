import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.7.0/types.ts";
import {
  CurrentSettingsVersion,
  SettingsDatastoreName,
} from "../datastores/settings_datastore.ts";
import {
  CreateLeaderboardUpdateScheduledTrigger,
  CreateReactionEventTrigger,
  CreateViewLeaderboardEventTrigger,
  DeleteTrigger,
  UpdateLeaderboardUpdateScheduledTrigger,
  UpdateReactionEventTrigger,
  UpdateViewLoaderboardEventTrigger,
} from "./runtime_event_trigger_functions.ts";

export const saveTriggers = async (
  client: SlackAPIClient,
  channelIds: string[],
  triggerIds: Partial<{
    reaction_added: string;
    reaction_removed: string;
    app_mentioned: string;
    leaderboard_update_scheduled: string;
  }>,
) => {
  const item = {
    version: CurrentSettingsVersion,
    trigger_channel_ids: channelIds,
    ...Object.entries(triggerIds).reduce(
      (out, [triggerName, triggerId]) => ({
        ...out,
        [`${triggerName}_trigger_id`]: triggerId,
      }),
      {},
    ),
  };

  console.log(item);

  const response = await client.apps.datastore.update({
    datastore: SettingsDatastoreName,
    item,
  });
  if (!response.ok) {
    throw new Error(
      `failed to update active trigger datastore: ${response.error}`,
    );
  }
  return response;
};

export const loadSettings = async (client: SlackAPIClient) => {
  const response = await client.apps.datastore.query({
    datastore: SettingsDatastoreName,
  });

  if (!response.ok) {
    throw new Error(
      `failed to get trigger data from datastore: ${response.error}`,
    );
  }

  return response.items[0];
};

export const UpdateSettingsFunctionDefinition = DefineFunction({
  callback_id: "update_settings",
  title: "Creates, updates, or deletes reaction event triggers",
  source_file: "functions/update_settings.ts",
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

const loadTriggerIds = async (client: SlackAPIClient) => {
  const settings = await loadSettings(client);
  const reactionAddedTriggerId = settings?.reaction_added_trigger_id;
  const reactionRemovedTriggerId = settings?.reaction_removed_trigger_id;
  const viewLeaderboardTriggerId = settings?.view_leaderboard_trigger_id;
  const leaderboardUpdateScheduledTriggerId = settings
    ?.leaderboard_update_scheduled_trigger_id;
  return {
    reactionAddedTriggerId,
    reactionRemovedTriggerId,
    viewLeaderboardTriggerId,
    leaderboardUpdateScheduledTriggerId,
  };
};

const persistStoredTriggers = async (
  client: SlackAPIClient,
  channelIds: string[],
) => {
  let {
    reactionAddedTriggerId,
    reactionRemovedTriggerId,
    viewLeaderboardTriggerId,
    leaderboardUpdateScheduledTriggerId,
  } = await loadTriggerIds(client);

  let reactionAddedTask;
  if (!reactionAddedTriggerId) {
    reactionAddedTask = CreateReactionEventTrigger(
      client,
      channelIds,
      "added",
    );
  } else {
    reactionAddedTask = UpdateReactionEventTrigger(
      client,
      reactionAddedTriggerId,
      channelIds,
      "added",
    );
  }

  reactionAddedTask.then(({ trigger }) => reactionAddedTriggerId = trigger.id);

  let reactionRemovedTask;
  if (!reactionRemovedTriggerId) {
    reactionRemovedTask = CreateReactionEventTrigger(
      client,
      channelIds,
      "removed",
    );
  } else {
    reactionRemovedTask = UpdateReactionEventTrigger(
      client,
      reactionRemovedTriggerId,
      channelIds,
      "removed",
    );
  }

  reactionRemovedTask.then(({ trigger }) => {
    reactionRemovedTriggerId = trigger.id;
  });

  let viewLeaderboardTask;
  if (!viewLeaderboardTriggerId) {
    viewLeaderboardTask = CreateViewLeaderboardEventTrigger(
      client,
      channelIds,
    );
  } else {
    viewLeaderboardTask = UpdateViewLoaderboardEventTrigger(
      client,
      viewLeaderboardTriggerId,
      channelIds,
    );
  }

  viewLeaderboardTask.then(({ trigger }) => {
    viewLeaderboardTriggerId = trigger.id;
  });

  let leaderboardUpdateScheduledTask;
  if (!leaderboardUpdateScheduledTriggerId) {
    leaderboardUpdateScheduledTask = CreateLeaderboardUpdateScheduledTrigger(
      client,
    );
  } else {
    leaderboardUpdateScheduledTask = UpdateLeaderboardUpdateScheduledTrigger(
      client,
      leaderboardUpdateScheduledTriggerId,
    );
  }

  leaderboardUpdateScheduledTask.then(({ trigger }) => {
    leaderboardUpdateScheduledTriggerId = trigger.id;
  });

  await Promise.all([
    reactionAddedTask,
    reactionRemovedTask,
    viewLeaderboardTask,
    leaderboardUpdateScheduledTask,
  ]);

  return {
    viewLeaderboardTriggerId,
    reactionAddedTriggerId,
    reactionRemovedTriggerId,
    leaderboardUpdateScheduledTriggerId,
  };
};

const clearStoredTriggers = async (
  client: SlackAPIClient,
) => {
  const triggerIds = await loadTriggerIds(client);
  await Promise.all(
    Object.values(triggerIds).map(
      (triggerId) => DeleteTrigger(client, triggerId),
    ),
  );

  return {
    viewLeaderboardTriggerId: "",
    reactionAddedTriggerId: "",
    reactionRemovedTriggerId: "",
    leaderboardUpdateScheduledTriggerId: "",
  };
};

const UpdateSettingsFunction = SlackFunction(
  UpdateSettingsFunctionDefinition,
  async ({ client, inputs }) => {
    let newIds;

    if (inputs.newChannels.length > 0) {
      console.log("persisting stored triggers");
      newIds = await persistStoredTriggers(client, inputs.newChannels);

      console.log("saved reaction listener triggers");
    } else { // user entered no triggers -> delete saved triggers
      console.log("no channels detected, removing listener triggers");
      newIds = await clearStoredTriggers(client);
    }

    console.log("saving trigger info to datastore");
    const saveResponse = await saveTriggers(
      client,
      inputs.newChannels,
      {
        reaction_added: newIds.reactionAddedTriggerId,
        reaction_removed: newIds.reactionRemovedTriggerId,
        app_mentioned: newIds.viewLeaderboardTriggerId,
        leaderboard_update_scheduled:
          newIds.leaderboardUpdateScheduledTriggerId,
      },
    );

    console.log("updateSettings datastore response", saveResponse);

    if (saveResponse.error) {
      throw new Error(
        `new active channels didn't save correctly: ${saveResponse.error}`,
      );
    }

    return { outputs: {} };
  },
);

export default UpdateSettingsFunction;
