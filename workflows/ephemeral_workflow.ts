import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

const ephemeralWorkflow = DefineWorkflow({
  callback_id: "ephemeral_workflow",
  title: "Send ephemeral message",
  description: "Send ephemeral message to channel",
  input_parameters: {
    properties: {
      userId: {
        type: Schema.slack.types.user_id,
        description: "user id received from whoever put the emoji",
      },
    },
    required: ["userId"],
  },
});

ephemeralWorkflow.addStep(
  Schema.slack.functions.SendEphemeralMessage,
  {
    channel_id: "C04NSNR0Q6P",
    user_id: ephemeralWorkflow.inputs.userId,
    message: "You reacted",
  },
);

export default ephemeralWorkflow;
