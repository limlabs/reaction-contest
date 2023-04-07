import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { getLeaderboardInfo } from "./update_leaderboard.ts";

export const ViewLeaderboardFunctionDefinition = DefineFunction({
  callback_id: "view_leaderboard",
  title: "View Top Reactions Leaderboard",
  description: "Gets all emoji data from datastore",
  source_file: "functions/view_leaderboard.ts",
  output_parameters: {
    properties: {
      leaderboardMessage: {
        type: Schema.slack.types.rich_text,
        description: "Message describing current leaderboard",
      },
    },
    required: ["leaderboardMessage"],
  },
});

const defaultMessage = ":fire: *Reaction Contest Leaderboard* :fire:\n";
const maxResults = 10;

export const getDisplayPlace = (index: number) => {
  if (index > 9) {
    return (index + 1).toString();
  }

  const displayPlace = (index + 1).toString();

  if (displayPlace.endsWith("1")) {
    let out = `${displayPlace}st`;
    if (index === 0) {
      out = `${out}`;
    }

    return out;
  }

  if (displayPlace.endsWith("2")) {
    return `${displayPlace}nd`;
  }

  if (displayPlace.endsWith("3")) {
    return `${displayPlace}rd`;
  }

  return `${displayPlace}th`;
};

export default SlackFunction(
  ViewLeaderboardFunctionDefinition,
  async ({ client }) => {
    const { data: leaderboardData } = await getLeaderboardInfo(client);
    if (leaderboardData.length === 0) {
      return {
        outputs: {
          leaderboardMessage:
            "No reactions detected :yawning_face: React to some posts to get a leaderboard going!",
        },
      };
    }
    let leaderboardMessage = defaultMessage;

    for (let i = 0; i < Math.min(leaderboardData.length, maxResults); ++i) {
      const item = leaderboardData[i];
      if (item.count === 0) {
        break;
      }

      const count = item.count === 1 ? "1 time" : `${item.count} times`;

      leaderboardMessage += `${
        getDisplayPlace(i)
      } - :${item.reaction}: - used ${count}\n`;
    }

    return { outputs: { leaderboardMessage } };
  },
);
