import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const AddEmojiToDatastoreFunctionDefinition = DefineFunction({
  callback_id: "add_emoji_to_datastore",
  title: "Add emoji to datastore",
  source_file: "functions/add_emoji_to_datastore.ts",
  input_parameters: {
    properties: {
      emoji: {
        type: Schema.types.string,
      },
    },
    required: ["emoji"],
  },
});

export default SlackFunction(
  AddEmojiToDatastoreFunctionDefinition,
  async ({ inputs, client }) => {
    console.log("emojiiii", inputs.emoji);
    const responseGet = await client.apps.datastore.get({
      datastore: "emoji_datastore",
      id: inputs.emoji,
    });
    console.log("responseGet ", responseGet);
    if (!responseGet.ok) {
      const error = `Failed to get a row from datastore: ${responseGet.error}`;
      console.log("HEY THE GET FAILED");
      return { error };
    }

    let dataToInsert;
    console.log("responseGet.items", responseGet.items);

    if (Object.keys(responseGet.item).length === 0) {
      dataToInsert = { emoji: inputs.emoji, quantity: 1 };
    } else {
      dataToInsert = {
        emoji: inputs.emoji,
        quantity: responseGet.item.quantity + 1,
      };
    }

    const response = await client.apps.datastore.put({
      datastore: "emoji_datastore",
      item: dataToInsert,
    });
    if (!response.ok) {
      const error = `Failed to save a row in datastore: ${response.error}`;
      return { error };
    } else {
      console.log(`Datastore updated: ${response.item}`);
      return { outputs: {} };
    }
  },
);
