import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { UpdateLeaderboardFunctionDefinition } from "../functions/update_leaderboard.ts";

const UpdateLeaderboardWorkflow = DefineWorkflow({
  callback_id: "update_leaderboard",
  title: "UpdateLeaderboard",
  description: "Updates top reaction leaderboard in the background",
});

UpdateLeaderboardWorkflow.addStep(
  UpdateLeaderboardFunctionDefinition,
  {},
);

export default UpdateLeaderboardWorkflow;
