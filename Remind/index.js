const _ = require("lodash")

module.exports = async function (context) {

    const trello = require("./trello")(context);
    const slack = require("./slack")(context);
    
    const reminders = await getReminders();
    await Promise.all(await reminders.map(toTrelloCard));
    context.done();
    
    async function getReminders() {
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
        await trello.createCard(
            `Respond: ${reminder.user.real_name}`,
            `> ${reminder.message.text}\n\n${reminder.text}`,
            timestampToEpoch(reminder.time));

        return await slack.reminders.complete(reminder.id);
    }

    function timestampToEpoch(value) {
        return value * 1000;
    }

};