import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

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

const inputForm = UpdateChannelsWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Submit active channels",
    description:
      "Copy/paste Slack channel ids separated by commas to track reactions on those channels.",
    interactivity: UpdateChannelsWorkflow.inputs.interactivity,
    submit_label: "Submit channels",
    fields: {
      elements: [
        {
          name: "channels",
          title: "Channels",
          type: Schema.types.string,
        },
      ],
      required: ["channels"],
    },
  },
);

export default UpdateChannelsWorkflow;
