import { Trigger } from "deno-slack-api/types.ts";
import HandleReactionWorkflow from "../workflows/handle_reaction_workflow.ts";

const HandleReactionAddedTrigger: Trigger<
  typeof HandleReactionWorkflow.definition
> = {
  type: "event",
  name: "React adds emoji to datastore",
  description: "react adds emoji to datastore",
  workflow: "#/workflows/handle_reaction_workflow",
  event: {
    event_type: "slack#/events/reaction_added",
    channel_ids: ["C04NSNR0Q6P"],
  },
  inputs: {
    reaction: {
      value: "{{data.reaction}}",
    },
    channelId: {
      value: "{{data.channel_id}}",
    },
    userId: {
      value: "{{data.user_id}}",
    },
    action: {
      value: "added",
    },
  },
};

export default HandleReactionAddedTrigger;
