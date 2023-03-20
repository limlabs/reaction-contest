# Overview

Welcome! Reaction Contest is an open source Slack app that keeps track of emoji reactions used in your workspace to generate a leaderboard of the most popular reactions. It's built with [Slack's new modular API](https://api.slack.com/future). Give it a try and tell us what you think!

## Quickstart

Apps built with Slack's new API require a workspace on a paid plan, with the Slack Platform Beta permission approved in your workspace's Settings & Permissions. (Pro tip: paid plan cannot still be in trial period.)

Install and configure the Slack CLI (steps 1 and 2 of [this guide](https://api.slack.com/future/quickstart)).

The following code block clones this repo, changes into the directory, and deploys:

```
slack create reaction-contest -t limlabs/reaction-contest
cd reaction-contest
slack deploy
```

Select your workspace to deploy to.

You'll now be asked to select a trigger to create with deploy. Select `triggers/update_leaderboard_trigger.ts` for best functionality.

Et voilà!

## Links

See our technical design doc [here](/docs/hld.md).
Look [here](/docs/slack.md) for a brief guide on how to run and build a Slack app.

## Donations

If you like what we're doing, please check out our [Buy Me a Coffee](https://www.buymeacoffee.com/limlabs) to make a one-time donation or set up a recurring membership. Your contribution will help us continue to develop this project and many more open source projects in the future. Thanks!
