import { Trigger } from "deno-slack-api/types.ts";
import ephemeralWorkflow from "../workflows/ephemeral_workflow.ts";

const ephMessageTrigger: Trigger<typeof ephemeralWorkflow.definition> = {
  type: "event",
  name: "Reactji ephemeral message",
  description: "sends ephemeral message whenever reactji is used in channel",
  workflow: "#/workflows/ephemeral_workflow",
  event: {
    event_type: "slack#/events/reaction_added",
    channel_ids: ["C04NSNR0Q6P"],
  },
  inputs: {
    userId: {
      value: "{{data.user_id}}",
    },
  },
};

export default ephMessageTrigger;
