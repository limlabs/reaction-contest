import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";
import UpdateLeaderboardFunction, {} from "./update_leaderboard.ts";
import { ReactionEventType } from "../domain/reaction.ts";
import UpdateChannelsFunction from "./update_channels.ts";

const { createContext } = SlackFunctionTester("update_leaderboard");

mf.install();

mf.mock("POST@/api/apps.datastore.put", () => {
  return new Response(
    JSON.stringify({
      ok: true,
    }),
  );
});

mf.mock("POST@/api/workflows.triggers.create", () => {
  return new Response(
    JSON.stringify({
      ok: true,
      trigger: {
        id: "mockTriggerId",
      },
    }),
  );
});

mf.mock("POST@/api/workflows.triggers.update", () => {
  return new Response(
    JSON.stringify({
      ok: true,
    }),
  );
});

Deno.test("UpdateChannelsFunction runs with empty datastore and with user input", async () => {
  mf.mock("POST@/api/apps.datastore.query", () => {
    return new Response(
      JSON.stringify({
        ok: true,
        items: [],
      }),
    );
  });

  const inputs = { newChannels: ["mockChannelOne", "mockChannelTwo"] };

  const { error } = await UpdateChannelsFunction(
    createContext({ inputs }),
  );
  assertEquals(error, undefined);
});
