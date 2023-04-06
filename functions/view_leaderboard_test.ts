import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import ViewLeaderboardFunction from "./view_leaderboard.ts";

mf.install();

const { createContext } = SlackFunctionTester("view_leaderboard");

Deno.test("View leaderboard function returns proper text with multiple things on leaderboard", async () => {
  const mockLeaderboardData = [
    { reaction: "grinning", count: 100 },
    { reaction: "smiley", count: 80 },
    { reaction: "face_with_peeking_eye", count: 75 },
    { reaction: "sob", count: 30 },
    { reaction: "eggplant", count: 15 },
  ];

  const mockLeaderboardMessage =
    ":fire: *Reaction Contest Leaderboard* :fire:\n1st - :grinning: - used 100 times\n2nd - :smiley: - used 80 times\n3rd - :face_with_peeking_eye: - used 75 times\n4th - :sob: - used 30 times\n5th - :eggplant: - used 15 times\n";

  mf.mock("POST@/api/apps.datastore.query", () => {
    return new Response(
      JSON.stringify({
        ok: true,
        items: [{ data: JSON.stringify(mockLeaderboardData) }],
      }),
    );
  });

  const { outputs } = await ViewLeaderboardFunction(
    createContext({ inputs: {} }),
  );

  assertEquals(outputs?.leaderboardMessage, mockLeaderboardMessage);
});

Deno.test("View leaderboard returns special message when leaderboard is empty", async () => {
  const mockLeaderboardData: never[] = [];

  const mockLeaderboardMessage =
    "No reactions detected :yawning_face: React to some posts to get a leaderboard going!";

  mf.mock(
    "POST@/api/apps.datastore.query",
    () => {
      return new Response(
        JSON.stringify({
          ok: true,
          items: [{ data: JSON.stringify(mockLeaderboardData) }],
        }),
      );
    },
  );
  const { outputs } = await ViewLeaderboardFunction(
    createContext({ inputs: {} }),
  );

  assertEquals(outputs?.leaderboardMessage, mockLeaderboardMessage);
});

Deno.test("View leaderboard returns special message when leaderboard data only has 0 counts", async () => {
  const mockLeaderboardData = [
    { reaction: "grinning", count: 0 },
    { reaction: "smiley", count: 0 },
    { reaction: "face_with_peeking_eye", count: 0 },
    { reaction: "sob", count: 0 },
    { reaction: "eggplant", count: 0 },
  ];

  const mockLeaderboardMessage =
    "No reactions detected :yawning_face: React to some posts to get a leaderboard going!";

  mf.mock(
    "POST@/api/apps.datastore.query",
    () => {
      return new Response(
        JSON.stringify({
          ok: true,
          items: [{ data: JSON.stringify(mockLeaderboardData) }],
        }),
      );
    },
  );
  const { outputs } = await ViewLeaderboardFunction(
    createContext({ inputs: {} }),
  );

  assertEquals(outputs?.leaderboardMessage, mockLeaderboardMessage);
});

Deno.test("View leaderboard doesn't show reactions with a 0 count", async () => {
  const mockLeaderboardData = [
    { reaction: "grinning", count: 100 },
    { reaction: "smiley", count: 80 },
    { reaction: "face_with_peeking_eye", count: 75 },
    { reaction: "sob", count: 0 },
    { reaction: "eggplant", count: 0 },
  ];

  const mockLeaderboardMessage =
    ":fire: *Reaction Contest Leaderboard* :fire:\n1st - :grinning: - used 100 times\n2nd - :smiley: - used 80 times\n3rd - :face_with_peeking_eye: - used 75 times\n";

  mf.mock(
    "POST@/api/apps.datastore.query",
    () => {
      return new Response(
        JSON.stringify({
          ok: true,
          items: [{ data: JSON.stringify(mockLeaderboardData) }],
        }),
      );
    },
  );
  const { outputs } = await ViewLeaderboardFunction(
    createContext({ inputs: {} }),
  );

  assertEquals(outputs?.leaderboardMessage, mockLeaderboardMessage);
});
