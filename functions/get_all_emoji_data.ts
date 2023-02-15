import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const GetAllEmojiDataDefinition = DefineFunction({
  callback_id: "get_all_emoji_data",
  title: "Get all emoji data",
  description: "Gets all emoji data from datastore",
  source_file: "functions/get_all_emoji_data.ts",
  output_parameters: {
    properties: {
      all_emojis: {
        type: Schema.types.object,
      },
    },
    required: ["all_emojis"],
  },
});

export default SlackFunction(
  GetAllEmojiDataDefinition,
  async ({ client }) => {
    const response = await client.apps.datastore.query({
      datastore: "emoji_datastore",
    });
    console.log("all emojis ", response);
    return {
      outputs: {
        all_emojis: response,
      },
    };
  },
);
