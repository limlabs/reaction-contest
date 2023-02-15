import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const EmojiDatastore = DefineDatastore({
  name: "emoji_datastore",
  primary_key: "emoji",
  attributes: {
    emoji: { type: Schema.types.string },
    quantity: { type: Schema.types.integer },
  },
});
