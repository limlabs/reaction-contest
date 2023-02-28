import { Trigger } from "https://deno.land/x/deno_slack_api@1.6.0/types.ts";
import { handleReactionInputsBase } from "../core/schemas.ts";
import HandleReactionWorkflow from "../workflows/handle_reaction_workflow.ts";

const HandleReactionRemovedTrigger: Trigger<
  typeof HandleReactionWorkflow.definition
> = {
  type: "event",
  name: "ReactionRemoved",
  description: "Handles when user removes reaction in channel",
  workflow: "#/workflows/handle_reaction_workflow",
  event: {
    event_type: "slack#/events/reaction_removed",
    channel_ids: ["C04NSNR0Q6P"],
  },
  inputs: { ...handleReactionInputsBase, action: { value: "removed" } },
};

export default HandleReactionRemovedTrigger;
