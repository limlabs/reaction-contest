import { Trigger } from "deno-slack-api/types.ts";
import SetupWorkflow from "../workflows/setup_workflow.ts";
import { TriggerTypes } from "https://deno.land/x/deno_slack_api@1.7.0/typed-method-types/workflows/triggers/mod.ts";

const setupTrigger: Trigger<typeof SetupWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Setup Reaction Contest",
  description: "Install and configure the Reaction Contest App",
  workflow: `#/workflows/${SetupWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: { value: "{{data.interactivity}}" },
    channel: { value: "{{data.channel_id}}" },
  },
};

export default setupTrigger;
