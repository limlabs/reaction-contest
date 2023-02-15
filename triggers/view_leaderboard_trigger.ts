import { Trigger } from "deno-slack-api/types.ts";
import ViewLeaderboardWorkflow from "../workflows/view_leaderboard_workflow.ts";

const viewLeaderboardTrigger: Trigger<
  typeof ViewLeaderboardWorkflow.definition
> = {
  type: "event",
  name: "View Leaderboard trigger",
  description: "/emoji-contest brings up current leaderboard",
  workflow: "#/workflows/view_leaderboard_workflow",
  event: {
    event_type: "slack#/events/message_posted",
    channel_ids: ["C04NSNR0Q6P"],
    filter: {
      version: 1,
      root: {
        statement: "{{data.text}} == /emoji-contest",
      },
    },
  },
  inputs: {
    userId: {
      value: "{{data.user_id}}",
    },
  },
};

export default viewLeaderboardTrigger;
