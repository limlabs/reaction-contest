import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { UpdateLeaderboardFunctionDefinition } from "../functions/update_leaderboard.ts";

const AppMentionedWorkflow = DefineWorkflow({
  callback_id: "app_mentioned",
  title: "App Mentioned",
});

AppMentionedWorkflow.addStep(
  UpdateLeaderboardFunctionDefinition,
  {},
);

export default AppMentionedWorkflow;
