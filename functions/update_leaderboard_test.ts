import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import UpdateLeaderboardFunction, {} from "./update_leaderboard.ts";
import { ReactionEventType } from "../domain/reaction.ts";

const { createContext } = SlackFunctionTester("update_leaderboard");

const mockLeaderboardData = [
  { reaction: "grinning", count: 100 },
  { reaction: "smiley", count: 80 },
  { reaction: "face_with_peeking_eye", count: 75 },
  { reaction: "sob", count: 30 },
  { reaction: "eggplant", count: 15 },
];

const mockEventsArray = [
  {
    id: "mockId",
    action: "removed" as ReactionEventType,
    shortcode: "man_in_business_suit_levitating",
    userId: "mockUserId",
    channelId: "mockChannelId",
    timestamp: 1001,
  },
  {
    id: "mockId",
    action: "added" as ReactionEventType,
    shortcode: "snakemoji",
    userId: "mockUserId",
    channelId: "mockChannelId",
    timestamp: 1002,
  },
  {
    id: "mockId",
    action: "added" as ReactionEventType,
    shortcode: "eyes",
    userId: "mockUserId",
    channelId: "mockChannelId",
    timestamp: 1003,
  },
];

mf.install();

mf.mock("POST@/api/apps.datastore.put", () => {
  return new Response(JSON.stringify({ ok: true, items: [] }));
});

Deno.test("UpdateLeaderboard works when there is an old leaderboard to update", async () => {
  mf.mock("POST@/api/apps.datastore.query", async (args) => {
    const body = await args.formData();
    if (body.get("datastore") === "emoji-contest-leaderboard") {
      return new Response(
        JSON.stringify({
          ok: true,
          items: [{
            last_updated_timestamp: 1000,
            data: JSON.stringify(mockLeaderboardData),
          }],
        }),
      );
    }
    if (body.get("datastore") === "emoji-contest-reactions") {
      return new Response(JSON.stringify({ ok: true, items: mockEventsArray }));
    } else {
      console.log("Unrecognized datastore query");
      return new Response(JSON.stringify({ ok: false }));
    }
  });

  const { error } = await UpdateLeaderboardFunction(
    createContext({ inputs: {} }),
  );

  assertEquals(error, undefined);
});

Deno.test("UpdateLeaderboard works when there is no old leaderboard to update", async () => {
  mf.mock("POST@/api/apps.datastore.query", async (args) => {
    const body = await args.formData();
    if (body.get("datastore") === "emoji-contest-leaderboard") {
      return new Response(
        JSON.stringify({
          ok: true,
          items: [],
        }),
      );
    }
    if (body.get("datastore") === "emoji-contest-reactions") {
      return new Response(JSON.stringify({ ok: true, items: mockEventsArray }));
    } else {
      console.log("Unrecognized datastore query");
      return new Response(JSON.stringify({ ok: false }));
    }
  });
  const { error } = await UpdateLeaderboardFunction(
    createContext({ inputs: {} }),
  );
  assertEquals(error, undefined);
});
