import { Trigger } from "deno-slack-api/types.ts";
import ViewLeaderboardWorkflow from "../workflows/view_leaderboard_workflow.ts";

const viewLeaderboardTrigger: Trigger<
  typeof ViewLeaderboardWorkflow.definition
> = {
  type: "shortcut",
  name: "View Leaderboard link trigger",
  description: "link sends message to channel with current leaderboard",
  workflow: "#/workflows/view_leaderboard_workflow",
  inputs: {
    channelId: {
      value: "{{data.channel_id}}",
    },
  },
};

export default viewLeaderboardTrigger;
