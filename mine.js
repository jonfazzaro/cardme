const _ = require("lodash")

module.exports = async function (context) {

    const slack = require("./slack")(context);
    const trello = require("./trello")(context);

    const result = await slack.reminders.get();
    await Promise.all(filtered(result.reminders).map(toTrelloCard));
    context.done();

    function filtered(reminders) {
        return _.chain(reminders)
            .filter(r => r.complete_ts == 0)
            .value();
    }

    async function toTrelloCard(reminder) {
        const permalink = reminder.text;
        const message = await slack.message(permalink);
        const user = await slack.user(message.user);

        await trello.createCard(
                `Respond to ${user.real_name}`,
            `> ${message.text}\n\n${permalink}`,
            timestampToEpoch(reminder.time));

        return await slack.reminders.complete(reminder.id);
    }

    function timestampToEpoch(value) {
        return value * 1000;
    }

};