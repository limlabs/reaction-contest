import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import UpdateSettingsFunction from "./update_settings.ts";

const { createContext } = SlackFunctionTester("update_settings");

mf.install();

mf.mock("POST@/api/apps.datastore.put", () => {
  return new Response(
    JSON.stringify({
      ok: true,
    }),
  );
});

mf.mock("POST@/api/apps.datastore.update", () => {
  return new Response(
    JSON.stringify({
      ok: true,
    }),
  );
});

mf.mock("POST@/api/apps.datastore.delete", () => {
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
      trigger: {
        id: "mockTriggerId",
      },
    }),
  );
});

mf.mock("POST@/api/workflows.triggers.delete", () => {
  return new Response(
    JSON.stringify({
      ok: true,
    }),
  );
});

Deno.test("UpdateSettingsFunction runs with empty datastore and with user input", async () => {
  mf.mock("POST@/api/apps.datastore.query", () => {
    return new Response(
      JSON.stringify({
        ok: true,
        items: [],
      }),
    );
  });

  const inputs = { newChannels: ["mockChannelOne", "mockChannelTwo"] };

  const { error } = await UpdateSettingsFunction(
    createContext({ inputs }),
  );
  assertEquals(error, undefined);
});

Deno.test("UpdateSettingsFunction runs with something in datastore and user input", async () => {
  mf.mock("POST@/api/apps.datastore.query", () => {
    return new Response(
      JSON.stringify({
        ok: true,
        items: [{
          channels: ["mockChannelOne", "mockChannelThree"],
          add_reaction_trigger_id: "mockTriggerID",
          remove_reaction_trigger_id: "mockTriggerID",
        }],
      }),
    );
  });

  const inputs = { newChannels: ["mockChannelOne", "mockChannelTwo"] };

  const { error } = await UpdateSettingsFunction(
    createContext({ inputs }),
  );
  assertEquals(error, undefined);
});

Deno.test("UpdateSettingsFunction runs with something in datastore and no user input", async () => {
  mf.mock("POST@/api/apps.datastore.query", () => {
    return new Response(
      JSON.stringify({
        ok: true,
        items: [{
          channels: ["mockChannelOne", "mockChannelThree"],
          add_reaction_trigger_id: "mockTriggerID",
          remove_reaction_trigger_id: "mockTriggerID",
        }],
      }),
    );
  });

  const inputs = { newChannels: [] };

  const { error } = await UpdateSettingsFunction(
    createContext({ inputs }),
  );
  assertEquals(error, undefined);
});
