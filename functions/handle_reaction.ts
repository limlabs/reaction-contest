import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.5.0/types.ts";
import { ReactionDatastoreName } from "../datastores/reaction_datastore.ts";
import {
  createReactionEvent,
  ReactionEvent,
  ReactionEventType,
} from "../domain/reaction.ts";

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

export const saveReaction = async (
  client: SlackAPIClient,
  reaction: ReactionEvent,
) => {
  const response = await client.apps.datastore.put({
    datastore: ReactionDatastoreName,
    item: reaction,
  });

  if (!response.ok) {
    throw new Error(
      `failed to get reactions from datastore: ${response.error}`,
    );
  }
};

export default SlackFunction(
  HandleReactionFunction,
  async ({ inputs, client }) => {
    const event = createReactionEvent({
      channelId: inputs.channelId,
      userId: inputs.userId,
      shortcode: inputs.reaction,
      action: inputs.action as ReactionEventType,
    });

    await saveReaction(client, event);

    console.log(`reaction ${event.action}, id ${event.id}`);

    return { outputs: { id: event.id } };
  },
);
