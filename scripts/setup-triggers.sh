slack deploy --no-prompt
slack trigger create --trigger-def triggers/update_leaderboard_trigger.ts
slack trigger create --trigger-def triggers/update_channels_form_trigger.ts
slack trigger create --trigger-def triggers/view_leaderboard_trigger.ts