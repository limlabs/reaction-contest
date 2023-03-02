import {
  assertSpyCall,
  returnsNext,
  stub,
} from "https://deno.land/std@0.178.0/testing/mock.ts";

import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import HandleReactionFunction, { saveReaction } from "./handle_reaction.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.7.0/types.ts";
import { ReactionDatastoreName } from "../datastores/reaction_datastore.ts";
import { ViewLeaderboardFunction } from "./view_leaderboard.ts";

mf.install();

const mockLeaderboardData = [
  { response: "grinning", count: 100 },
  { response: "smiley", count: 80 },
  { response: "face_with_peeking_eye", count: 75 },
  { response: "sob", count: 30 },
  { response: "eggplant", count: 15 },
];

mf.mock("POST@/api/apps.datastore.query", () => {
  return new Response(
    JSON.stringify({
      ok: true,
      items: [{ data: JSON.stringify(mockLeaderboardData) }],
    }),
  );
});

Deno.test("View leaderboard function returns proper text", async () => {
  // const { createContext } = SlackFunctionTester("view_leaderboard");
  // const { outputs } = await ViewLeaderboardFunction(
  //   createContext(),
  // );
});
