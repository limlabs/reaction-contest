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

// TODO:
// 1. Fix sorting
// 2. Prevent negative values from being stored
export const topReactions = (
  events: ReactionEvent[],
  limit = 10,
): ReactionLeaderboardEntry[] => {
  const totals = events.reduce((acc, event) => {
    if (!acc[event.shortcode]) {
      acc[event.shortcode] = 0;
    }

    const diff = event.action === "added" ? 1 : -1;
    acc[event.shortcode] += diff;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(totals).sort(([, count1], [, count2]) =>
    count1 - count2
  ).slice(0, limit).map(([reaction, count]) => ({
    reaction,
    count,
  }));
};
