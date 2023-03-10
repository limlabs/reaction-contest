import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetTriggerDataFunctionDefinition } from "../functions/get_trigger_data.ts";

const UpdateChannelsWorkflow = DefineWorkflow({
  callback_id: "update_channels_workflow",
  title: "Update active channels",
  description: "Update active channels for reaction event triggers.",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      channel: { type: Schema.slack.types.channel_id },
    },
    required: ["interactivity"],
  },
});

const triggerData = UpdateChannelsWorkflow.addStep(
  GetTriggerDataFunctionDefinition,
  { interactivity: UpdateChannelsWorkflow.inputs.interactivity },
);

const inputForm = UpdateChannelsWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Submit active channels",
    description:
      "Copy/paste Slack channel ids separated by commas to track reactions on those channels.",
    interactivity: triggerData.outputs.interactivity,
    submit_label: "Submit channels",
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
      required: ["channels"],
    },
  },
);

if (inputForm.outputs.fields.channels === "hello") {
  UpdateChannelsWorkflow.addStep(Schema.slack.functions.SendMessage, {
    channel_id: UpdateChannelsWorkflow.inputs.channel,
    message: "U typed hiiiiii",
  });
} else {
  UpdateChannelsWorkflow.addStep(Schema.slack.functions.SendMessage, {
    channel_id: UpdateChannelsWorkflow.inputs.channel,
    message: `U typed ${inputForm.outputs.fields.channels}!`,
  });
}

export default UpdateChannelsWorkflow;
