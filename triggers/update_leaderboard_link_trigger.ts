import { Trigger } from "deno-slack-api/types.ts";
import UpdateLeaderboardWorkflow from "../workflows/update_leaderboard_workflow.ts";

const UpdateTrigger: Trigger<typeof UpdateLeaderboardWorkflow.definition> = {
  type: "shortcut",
  name: "Link trigger to update leaderboard",
  workflow: "#/workflows/update_leaderboard_workflow",
};

export default UpdateTrigger;
