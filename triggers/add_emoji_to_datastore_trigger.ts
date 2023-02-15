import { Trigger } from "deno-slack-api/types.ts";
import AddEmojiToDatastoreWorkflow from "../workflows/add_emoji_to_datastore_workflow.ts";

const AddEmojiToDatastoreTrigger: Trigger<
  typeof AddEmojiToDatastoreWorkflow.definition
> = {
  type: "event",
  name: "React adds emoji to datastore",
  description: "react adds emoji to datastore",
  workflow: "#/workflows/add_emoji_to_datastore_workflow",
  event: {
    event_type: "slack#/events/reaction_added",
    channel_ids: ["C04NSNR0Q6P"],
  },
  inputs: {
    emoji: {
      value: "{{data.reaction}}",
    },
  },
};

export default AddEmojiToDatastoreTrigger;
