import { Manifest } from "deno-slack-sdk/mod.ts";
import { ReactionDatastore } from "./datastores/reaction_datastore.ts";
import ViewLeaderboardWorkflow from "./workflows/view_leaderboard_workflow.ts";
import HandleReactionAddedWorkflow from "./workflows/handle_reaction_workflow.ts";
import UpdateLeaderboardWorkflow from "./workflows/update_leaderboard_workflow.ts";
import { LeaderboardDatastore } from "./datastores/leaderboard_datastore.ts";
import { SettingsDatastore } from "./datastores/settings_datastore.ts";
import SetupWorkflow from "./workflows/setup_workflow.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "Reaction Contest",
  description: "A leaderboard that tracks the most popular emoji reactions.",
  icon: "assets/cry-cat.png",
  workflows: [
    HandleReactionAddedWorkflow,
    UpdateLeaderboardWorkflow,
    ViewLeaderboardWorkflow,
    SetupWorkflow,
  ],
  outgoingDomains: [],
  datastores: [ReactionDatastore, LeaderboardDatastore, SettingsDatastore],
  functions: [],
  botScopes: [
    "app_mentions:read",
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "channels:history",
    "groups:history",
    "im:read",
    "mpim:read",
    "reactions:read",
    "triggers:write",
  ],
});
