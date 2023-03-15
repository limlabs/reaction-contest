import { Manifest } from "deno-slack-sdk/mod.ts";
import { ReactionDatastore } from "./datastores/reaction_datastore.ts";
import ViewLeaderboardWorkflow from "./workflows/view_leaderboard_workflow.ts";
import HandleReactionAddedWorkflow from "./workflows/handle_reaction_workflow.ts";
import UpdateLeaderboardWorkflow from "./workflows/update_leaderboard_workflow.ts";
import { LeaderboardDatastore } from "./datastores/leaderboard_datastore.ts";
import { TriggerDatastore } from "./datastores/trigger_datastore.ts";
import UpdateChannelsWorkflow from "./workflows/update_channels_workflow.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "reaction-contest",
  description:
    "A sample that demonstrates using a function, workflow and trigger to send a greeting",
  icon: "assets/default_new_app_icon.png",
  workflows: [
    HandleReactionAddedWorkflow,
    UpdateLeaderboardWorkflow,
    ViewLeaderboardWorkflow,
    UpdateChannelsWorkflow,
  ],
  outgoingDomains: [],
  datastores: [ReactionDatastore, LeaderboardDatastore, TriggerDatastore],
  functions: [],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "reactions:read",
    "datastore:read",
    "datastore:write",
    "channels:history",
    "groups:history",
    "im:read",
    "mpim:read",
    "triggers:write",
  ],
});
