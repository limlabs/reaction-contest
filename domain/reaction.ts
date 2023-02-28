export type ReactionEventType = "added" | "removed";

export interface ReactionEvent {
  id: string;
  action: ReactionEventType;
  shortcode: string;
  userId: string;
  channelId: string;
  timestamp: number;
}

export const createReactionEvent = (
  opts: Pick<ReactionEvent, "action" | "shortcode" | "userId" | "channelId">,
): ReactionEvent => {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...opts,
  };
};
