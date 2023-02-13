import { Trigger } from "deno-slack-api/types.ts";
import GreetingWorkflow from "../workflows/greeting_workflow.ts";

const reactjiTrigger: Trigger<typeof GreetingWorkflow.definition> = {
  type: "event",
  name: "Reactji response",
  description: "responds to any reactji added to a post",
  workflow: "#/workflows/greeting_workflow",
  event: {
    event_type: "slack#/events/reaction_added",
    channel_ids: ["C04NSNR0Q6P"],
  },
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel: {
      value: "C04NSNR0Q6P",
    },
  },
};

export default reactjiTrigger;
