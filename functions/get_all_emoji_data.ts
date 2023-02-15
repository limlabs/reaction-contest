import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const GetAllEmojiDataDefinition = DefineFunction({
  callback_id: "get_all_emoji_data",
  title: "Get all emoji data",
  description: "Gets all emoji data from datastore",
  source_file: "functions/get_all_emoji_data.ts",
  // output_parameters: {
  //   properties: {
  //     topTen: {
  //       type: Schema.types.array,
  //       items: {
  //         type: Schema.types.object,
  //       },
  //     },
  //   },
  //   required: ["topTen"],
  // },
});

export default SlackFunction(
  GetAllEmojiDataDefinition,
  async ({ inputs, client }) => {
    const { ok, items, error } = await client.apps.datastore.query({
      datastore: "emoji_datastore",
    });
    if (!ok) {
      const err = `Failed to get data from datastore: ${error}`;
      return { err };
    }
    items.sort((a, b) => b.quantity - a.quantity);
    const topTen = items.filter((item) => items.indexOf(item) < 10);
    console.log("top ten", topTen);
    return {
      outputs: {
        topTen: topTen,
        userId: inputs.userId,
      },
    };
  },
);
