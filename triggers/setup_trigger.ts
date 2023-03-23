import { Trigger } from "deno-slack-api/types.ts";
import SetupWorkflow from "../workflows/setup_workflow.ts";

const setupTrigger: Trigger<typeof SetupWorkflow.definition> = {
  type: "shortcut",
  name: "Setup Reaction Contest",
  description: "Install and configure the Reaction Contest App",
  workflow: `#/workflows/${SetupWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: { value: "{{data.interactivity}}" },
    channel: { value: "{{data.channel_id}}" },
  },
};

export default setupTrigger;
