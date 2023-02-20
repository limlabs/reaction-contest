import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { appPrefix } from "../core/config.ts";

export const LeaderboardDatastoreName = `${appPrefix}-leaderboard`;

export const LeaderboardDatastore = DefineDatastore({
  name: LeaderboardDatastoreName,
  primary_key: "id",
  attributes: {
    id: { type: Schema.types.string }, // store the original reaction id
    last_updated_timestamp: { type: Schema.types.integer }, // store the last time the leaderboard was updated
    leaderboard: { type: Schema.types.string }, // stored as a string to keep the type flexible
  },
});
