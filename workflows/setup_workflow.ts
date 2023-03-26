import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetTriggerDataFunctionDefinition } from "../functions/get_trigger_data.ts";
import { UpdateSettingsFunctionDefinition } from "../functions/update_settings.ts";

const SetupWorkflow = DefineWorkflow({
  callback_id: "setup_workflow",
  title: "Setup",
  description: "Setup and manage Reaction Contest in this workspace",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      channel: { type: Schema.slack.types.channel_id },
    },
    required: ["interactivity"],
  },
});

const triggerData = SetupWorkflow.addStep(
  GetTriggerDataFunctionDefinition,
  { interactivity: SetupWorkflow.inputs.interactivity },
);

const inputForm = SetupWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Setup Reaction Contest",
    description:
      "Select channels to listen for reactions. Once you're done, select 'Finish Setup' to install and use @Reaction Contest!",
    interactivity: triggerData.outputs.interactivity,
    submit_label: "Finish Setup",
    fields: {
      elements: [
        {
          name: "channels",
          title: "Channels",
          type: Schema.types.array,
          items: {
            title: "channel",
            description: "channels for reaction events",
            type: Schema.slack.types.channel_id,
          },
          default: triggerData.outputs.channels,
        },
      ],
      required: [],
    },
  },
);

SetupWorkflow.addStep(
  Schema.slack.functions.SendMessage,
  {
    channel_id: SetupWorkflow.inputs.channel,
    message: "Finishing things up, one sec! :hourglass_flowing_sand:",
  },
);

SetupWorkflow.addStep(UpdateSettingsFunctionDefinition, {
  newChannels: inputForm.outputs.fields.channels,
});

SetupWorkflow.addStep(
  Schema.slack.functions.SendMessage,
  {
    channel_id: SetupWorkflow.inputs.channel,
    message: [
      ":tada: Setup complete. Looks like Reaction Contest is good to go! :sunglasses:",
      "Invite and mention @Reaction Contest to view the current leaderboard in any channel.",
    ].join("\n\n"),
  },
);

export default SetupWorkflow;
