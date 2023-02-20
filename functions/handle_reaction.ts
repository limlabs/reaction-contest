import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { ReactionEventType } from "../core/models.ts";
import { saveReaction } from "../datastores/reaction_datastore.ts";

export const HandleReactionFunction = DefineFunction({
  callback_id: "handle_reaction",
  title: "Add emoji to datastore",
  source_file: "functions/handle_reaction.ts",
  input_parameters: {
    properties: {
      reaction: {
        type: Schema.types.string,
      },
      userId: {
        type: Schema.types.string,
      },
      channelId: {
        type: Schema.types.string,
      },
      action: {
        type: Schema.types.string,
        enum: ["added", "removed"],
      },
    },
    required: ["reaction", "channelId", "userId", "action"],
  },
  output_parameters: {
    properties: {
      id: {
        type: Schema.types.string,
      },
    },
    required: ["id"],
  },
});

export default SlackFunction(
  HandleReactionFunction,
  async ({ inputs, client }) => {
    const event = {
      id: crypto.randomUUID(),
      channelId: inputs.channelId,
      userId: inputs.userId,
      shortcode: inputs.reaction,
      action: inputs.action as ReactionEventType,
      timestamp: Date.now(),
    };

    await saveReaction(client, event);

    console.log(`reaction added, id ${event.id}`);

    return { outputs: { id: event.id } };
  },
);
