const _ = require("lodash")

module.exports = async function (context) {

    const trello = require("./trello")(context);
    
    const tokens = process.env.slackToken.split(';');
    await Promise.all(tokens.map(async t => {
        const slack = require("./slack")(context, t);
        const reminders = await getReminders(slack);
        await Promise.all(await reminders.map(toTrelloCard));
        await complete(slack, reminders);
    }));

    context.done();
    
    async function getReminders(slack) {
        const result = await slack.reminders.get();
        return await Promise.all(
            _.chain(result.reminders)
                .filter(r => r.complete_ts == 0)
                .sortBy(r => r.time)
                .map(expanded)
                .value());

        async function expanded(reminder) {
            const message = await slack.message(reminder.text);
            const user = await slack.user(message.user);
            return { ...reminder, message, user };
        }
    }

    async function toTrelloCard(reminder) {
        return await trello.createCard(
            `Respond: ${reminder.user.real_name}`,
            `> ${reminder.message.text}\n\n${reminder.text}`,
            timestampToEpoch(reminder.time));
    }

    async function complete(slack, reminders) {
        return await Promise.all(
            reminders.map(r => slack.reminders.complete(r.id)));
    }

    function timestampToEpoch(value) {
        return value * 1000;
    }

};