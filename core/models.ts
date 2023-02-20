export type ReactionEventType = "added" | "removed";
export interface ReactionEvent {
  id: string;
  action: ReactionEventType;
  shortcode: string;
  userId: string;
  channelId: string;
  timestamp: number;
}
