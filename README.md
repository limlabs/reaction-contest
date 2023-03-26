# Reaction Contest

**Oh hey! You made it!** 🎉

![reaction contest logo](./assets/logo.png)


Reaction Contest is a free, open-source Slack app that generates a leaderboard of the most popular emojis in your workspace. It's built with
[Slack's new modular API](https://api.slack.com/future). 

We use it internally at [Liminal](https://www.buymeacoffee.com/limlabs) 🕴️ and thought others might like it, too. Take it for a spin 🌀 and tell
us what you think!

## Quickstart

Apps built with Slack's new API require a workspace on a paid plan, with the
Slack Platform Beta permission approved in your workspace's Settings &
Permissions. 

_(Pro tip: paid plan cannot still be in trial period. Go talk to support and pay up if needed 💸)_

1. Install and configure the Slack CLI (from the
[Slack beta platform guide](https://api.slack.com/future/quickstart)).

    ```bash
    # Install the Slack CLI
    curl -fsSL https://downloads.slack-edge.com/slack-cli/install.sh | bash

    # Authorize the Slack CLI with your workspace
    slack login
    ```

2. Install Reaction Contest into your workspace using the Slack CLI:

    ```
    slack create reaction-contest -t limlabs/reaction-contest
    cd reaction-contest
    slack deploy
    ```

    You will be asked to choose a workspace and trigger. The default options are fine for now!

3. In the output of the last step, there should be a shortcut URL after the part where the trigger definition file was chosen. It will show up in a section like this:

    ![screenshot of a setup trigger console output](./assets/setup_trigger_shortcut_screenshot.png)

    Copy this URL and paste it into a DM with yourself, and hit enter.

4. Click the Start button that looks like the screenshot below:

    ![screenshot of shortcut trigger in Slack](./assets/setup_shortcut_slack_screenshot.png)

5.  Configure the channels you want to run the contest in and click Save.

Et voilà! You should see a welcome message from the Reaction Contest bot confirming setup is complete.

## Usage

Summon your leaderboard by inviting and mentioning the Reaction Contest bot! You should see something that looks like this:

![Example usage screenshot](./assets/example_usage_screenshot.png)

## Links

- [Technical design doc](/docs/hld.md).
- [Original Slack App quickstart](docs/slack.md)

## ❤️ Donations  🪙

If you like what we're doing, please check out our
[Buy Me a Coffee](https://www.buymeacoffee.com/limlabs) to make a one-time
donation or set up a recurring membership. 

Your contribution will help us
continue to develop this project and many more open source projects in the
future. Thanks!
