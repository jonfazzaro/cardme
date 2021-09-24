# Card Me

I kept not checking my Slack reminders. So I made **an Azure Function that turns them into Trello cards**.

# Slack API permissions

This function requires the following permissions from Slack's API.

	channels:history
	groups:history
	im:history
	mpim:history
	reminders:read
	reminders:write
	users:read

(More deets coming soon.)
