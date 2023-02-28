import { Trigger } from "deno-slack-api/types.ts";
import UpdateLeaderboardWorkflow from "../workflows/update_leaderboard_workflow.ts";

const trigger: Trigger<typeof UpdateLeaderboardWorkflow.definition> = {
  name: "BackgroundUpdate",
  type: "scheduled",
  workflow: "#/workflows/update_leaderboard_workflow",
  schedule: {
    frequency: {
      type: "hourly",
    },
    start_time: new Date(Date.now() + 1000 * 5).toISOString(),
  },
};

export default trigger;
