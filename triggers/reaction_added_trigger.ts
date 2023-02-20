import { Trigger } from "deno-slack-api/types.ts";
import { handleReactionInputsBase } from "../core/schemas.ts";
import HandleReactionWorkflow from "../workflows/handle_reaction_workflow.ts";

const HandleReactionAddedTrigger: Trigger<
  typeof HandleReactionWorkflow.definition
> = {
  type: "event",
  name: "ReactionAdded",
  description: "Handles when user adds reaction in channel",
  workflow: "#/workflows/handle_reaction_workflow",
  event: {
    event_type: "slack#/events/reaction_added",
    channel_ids: ["C04NSNR0Q6P"],
  },
  inputs: { ...handleReactionInputsBase, action: { value: "added" } },
};

export default HandleReactionAddedTrigger;
