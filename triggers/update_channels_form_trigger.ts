import { Trigger } from "deno-slack-api/types.ts";
import UpdateChannelsWorkflow from "../workflows/update_channels_workflow.ts";

const updateChannelsTrigger: Trigger<typeof UpdateChannelsWorkflow.definition> =
  {
    type: "shortcut",
    name: "Update channels",
    description: "Update channels for reactions events",
    workflow: `#/workflows/${UpdateChannelsWorkflow.definition.callback_id}`,
    inputs: {
      interactivity: { value: "{{data.interactivity}}" },
      channel: { value: "{{data.channel_id}}" },
    },
  };

export default updateChannelsTrigger;
