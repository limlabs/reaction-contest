import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { UpdateLeaderboardFunctionDefinition } from "../functions/update_leaderboard.ts";

const UpdateLeaderboardWorkflow = DefineWorkflow({
  callback_id: "update_leaderboard_workflow",
  title: "UpdateLeaderboard",
  description: "Updates top reaction leaderboard in the background",
});

UpdateLeaderboardWorkflow.addStep(
  UpdateLeaderboardFunctionDefinition,
  {},
);

export default UpdateLeaderboardWorkflow;
