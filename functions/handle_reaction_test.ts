import {
  returnsNext,
  stub,
} from "https://deno.land/std@0.178.0/testing/mock.ts";

import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import HandleReactionFunction from "./handle_reaction.ts";

const { createContext } = SlackFunctionTester("handle_reaction");
const testUserId = "a99ad6f5-107b-4f8e-9ee3-3d5630308ae2";

stub(crypto, "randomUUID", returnsNext([testUserId]));

// Replaces globalThis.fetch with the mocked copy
mf.install();

mf.mock("POST@/api/apps.datastore.put", () => {
  return new Response(JSON.stringify({ ok: true, items: [] }));
});

Deno.test("Handle Reaction added works", async () => {
  const inputs = {
    channelId: "ABC123",
    userId: "testUser1",
    reaction: "snakemoji",
    action: "added",
  };

  const { outputs } = await HandleReactionFunction(createContext({ inputs }));
  assertEquals(
    outputs?.id,
    testUserId,
  );
});

Deno.test("Handle Reaction removed works", () => {
  // @nathburg add test here!
});
