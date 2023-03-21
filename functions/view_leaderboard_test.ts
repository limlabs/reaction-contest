import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import ViewLeaderboardFunction from "./view_leaderboard.ts";

mf.install();

const mockLeaderboardData = [
  { reaction: "grinning", count: 100 },
  { reaction: "smiley", count: 80 },
  { reaction: "face_with_peeking_eye", count: 75 },
  { reaction: "sob", count: 30 },
  { reaction: "eggplant", count: 15 },
];

const mockLeaderboardMessage =
  "*Reaction Contest Leaderboard*\n1. :grinning: was used 100 times\n2. :smiley: was used 80 times\n3. :face_with_peeking_eye: was used 75 times\n4. :sob: was used 30 times\n5. :eggplant: was used 15 times\n";

mf.mock("POST@/api/apps.datastore.query", () => {
  return new Response(
    JSON.stringify({
      ok: true,
      items: [{ data: JSON.stringify(mockLeaderboardData) }],
    }),
  );
});

Deno.test("View leaderboard function returns proper text", async () => {
  const { createContext } = SlackFunctionTester("view_leaderboard");
  const { outputs } = await ViewLeaderboardFunction(
    createContext({ inputs: {} }),
  );
  assertEquals(outputs?.leaderboardMessage, mockLeaderboardMessage);
});
