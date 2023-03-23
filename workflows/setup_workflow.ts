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
    title: "SetupReactionContest",
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

SetupWorkflow.addStep(UpdateSettingsFunctionDefinition, {
  newChannels: inputForm.outputs.fields.channels,
});

SetupWorkflow.addStep(
  Schema.slack.functions.SendMessage,
  {
    channel_id: SetupWorkflow.inputs.channel,
    message:
      ":hands_raised: Setup complete. Looks like Reaction Contest is good to go! :sunglasses:",
  },
);

export default SetupWorkflow;
