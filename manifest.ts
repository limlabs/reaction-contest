import { Manifest } from "deno-slack-sdk/mod.ts";
import { EmojiDatastore } from "./datastores/emoji_datastore.ts";
import AddEmojiToDatastoreWorkflow from "./workflows/add_emoji_to_datastore_workflow.ts";
import ephemeralWorkflow from "./workflows/ephemeral_workflow.ts";
import GreetingWorkflow from "./workflows/greeting_workflow.ts";
import ViewLeaderboardWorkflow from "./workflows/view_leaderboard_workflow.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "emoji-contest",
  description:
    "A sample that demonstrates using a function, workflow and trigger to send a greeting",
  icon: "assets/default_new_app_icon.png",
  workflows: [
    GreetingWorkflow,
    ephemeralWorkflow,
    AddEmojiToDatastoreWorkflow,
    ViewLeaderboardWorkflow,
  ],
  outgoingDomains: [],
  datastores: [EmojiDatastore],
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
  ],
});

// {"datastore": "emoji_datastore", "item": {"emoji": "smiley", "quantity": 1}}
// {"item": {"emoji": "smiley", "quantity": 1}, "datastore": "emoji_datastore"}
