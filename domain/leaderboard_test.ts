import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { topReactions } from "./leaderboard.ts";
import { ReactionEventType } from "./reaction.ts";

Deno.test("topReactions modifies leaderboard as expected", () => {
  const mockEventsArray = [
    {
      id: "mockId",
      action: "removed" as ReactionEventType,
      shortcode: "man_in_business_suit_levitating",
      userId: "mockUserId",
      channelId: "mockChannelId",
      timestamp: 25,
    },
    {
      id: "mockId",
      action: "added" as ReactionEventType,
      shortcode: "snakemoji",
      userId: "mockUserId",
      channelId: "mockChannelId",
      timestamp: 29,
    },
    {
      id: "mockId",
      action: "added" as ReactionEventType,
      shortcode: "eyes",
      userId: "mockUserId",
      channelId: "mockChannelId",
      timestamp: 30,
    },
  ];

  const mockOldLeaderboard = [
    {
      reaction: "eyes",
      count: 10,
    },
    {
      reaction: "man_in_business_suit_levitating",
      count: 5,
    },
  ];

  const expectedOutput = [
    {
      reaction: "eyes",
      count: 11,
    },
    {
      reaction: "man_in_business_suit_levitating",
      count: 4,
    },
    {
      reaction: "snakemoji",
      count: 1,
    },
  ];

  const newLeaderboard = topReactions(mockEventsArray, mockOldLeaderboard);
  assertEquals(newLeaderboard, expectedOutput);
});
