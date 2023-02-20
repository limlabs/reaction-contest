import { Trigger } from "deno-slack-api/types.ts";
import HandleReactionWorkflow from "../workflows/handle_reaction_workflow.ts";

const handleReactionInputsBase = {
  reaction: {
    value: "{{data.reaction}}",
  },
  channelId: {
    value: "{{data.channel_id}}",
  },
  userId: {
    value: "{{data.user_id}}",
  },
};

export const HandleReactionAddedTrigger: Trigger<
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

export const HandleReactionRemovedTrigger: Trigger<
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
