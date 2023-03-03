import {
  assertSpyCall,
  returnsNext,
  stub,
} from "https://deno.land/std@0.178.0/testing/mock.ts";

import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { SlackAPIClient } from "https://deno.land/x/deno_slack_api@1.7.0/types.ts";
import { ReactionDatastoreName } from "../datastores/reaction_datastore.ts";
import HandleReactionFunction, { saveReaction } from "./handle_reaction.ts";

const { createContext } = SlackFunctionTester("handle_reaction");
const testUserId = "a99ad6f5-107b-4f8e-9ee3-3d5630308ae2";

stub(crypto, "randomUUID", returnsNext([testUserId, testUserId]));

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

Deno.test("Event is saved to datastore with correct properties", async () => {
  const mockClient = {
    apps: {
      datastore: {
        put: () => {},
      },
    },
  } as unknown as SlackAPIClient;

  // deno-lint-ignore no-explicit-any
  const returnedPromise = Promise.resolve({ ok: true }) as any;

  const datastorePutStub = stub(
    mockClient.apps.datastore,
    "put",
    returnsNext([returnedPromise]),
  );

  const mockReactionEvent = {
    id: "1234",
    action: "added" as const,
    shortcode: "",
    userId: "",
    channelId: "",
    timestamp: 5,
  };
  await saveReaction(mockClient, mockReactionEvent);
  console.log(datastorePutStub.calls);
  assertSpyCall(datastorePutStub, 0, {
    args: [{ datastore: ReactionDatastoreName, item: mockReactionEvent }],
    returned: returnedPromise,
  });
});
