import { ReactionEvent } from "./reaction.ts";

export interface ReactionLeaderboardEntry {
  reaction: string;
  count: number;
}

export type ReactionLeaderboard = {
  name: string;
  data: ReactionLeaderboardEntry[];
  last_updated: number;
};

export const createReactionLeaderboard = (
  name: string,
  data: ReactionLeaderboardEntry[],
): ReactionLeaderboard => {
  return {
    name,
    data,
    last_updated: Date.now(),
  };
};

export const topReactions = (
  events: ReactionEvent[],
  oldLeaderboardArr: ReactionLeaderboardEntry[],
  limit = 10,
): ReactionLeaderboardEntry[] => {
  const oldLeaderboardObj: Record<string, number> = {};
  for (const item of oldLeaderboardArr) {
    oldLeaderboardObj[item.reaction] = item.count;
  }

  const totals = events.reduce((acc, event) => {
    if (!acc[event.shortcode]) {
      acc[event.shortcode] = 0;
    }

    const diff = event.action === "added" ? 1 : -1;

    if (acc[event.shortcode] + diff >= 0) acc[event.shortcode] += diff;
    return acc;
  }, oldLeaderboardObj);

  return Object.entries(totals).sort(([, count1], [, count2]) =>
    count2 - count1
  ).slice(0, limit).map(([reaction, count]) => ({
    reaction,
    count,
  }));
};
