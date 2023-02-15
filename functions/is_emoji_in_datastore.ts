import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const IsEmojiInDatastoreFunctionDefinition = DefineFunction({
  callback_id: "is_emoji_in_datastore",
  title: "Is Emoji in Datastore",
  source_file: "functions/is_emoji_in_datastore.ts",
  input_parameters: {
    properties: {
      emoji: {
        type: Schema.types.string,
      },
    },
    required: ["emoji"],
  },
  output_parameters: {
    properties: {
      emoji: {
        type: Schema.types.string,
      },
      quantity: {
        type: Schema.types.integer,
      },
    },
    required: ["emoji", "quantity"],
  },
});

export default SlackFunction(
  IsEmojiInDatastoreFunctionDefinition,
  async ({ inputs, client }) => {
    const response = await client.apps.datastore.get({
      datastore: "emoji_datastore",
      id: inputs.emoji,
    });
    if (!response.ok) {
      const error = `Failed to get a row from datastore: ${response.error}`;
      return { error };
    }
    if (Object.keys(response.items).length === 0) {
      return {
        outputs: {
          emoji: inputs.emoji,
          quantity: 1,
        },
      };
    } else {
      return {
        outputs: {
          emoji: inputs.emoji,
          quantity: response.item.quantity + 1,
        },
      };
    }
  },
);
