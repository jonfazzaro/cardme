const _ = require("lodash")
const fetch = require("node-fetch");

module.exports = async function (context) {

    const result = await slack(`reminders.list`);
    await Promise.all(filtered(result.reminders).map(card));
    context.done();

    function filtered(reminders) {
        return _.chain(reminders)
            .filter(r => r.complete_ts == 0)
            .sortBy(r => r.time)
            .value();
    }

    async function card(reminder) {
        const permalink = reminder.text
        const m = await message(permalink);
        const u = await user(m.user);
        await createCard(
            `Respond to ${u.real_name}`,
            `> ${m.text}\n\n${permalink}`,
            timestampToEpoch(reminder.time));
        return await complete(reminder.id);
    }

    function timestampToEpoch(value) {
        return value * 1000;
    }

    async function message(permalink) {
        const response = isThreadedMessage(permalink) ?
            await slack("conversations.replies", threadedMessageParameters(permalink)) :
            await slack("conversations.history", messageParameters(permalink));

        return response.messages[0];
    }

    function isThreadedMessage(permalink) {
        return permalink.includes('thread_ts')
    }

    function threadedMessageParameters(permalink) {
        const pathElements = permalink.substring(8).split('/');
        const channel = pathElements[2];

        var ts = pathElements[3].substring(0, pathElements[3].indexOf('?'));
        ts = ts.substring(0, ts.length - 6) + '.' + ts.substring(ts.length - 6);

        var latest = pathElements[3].substring(pathElements[3].indexOf('thread_ts=') + 10);
        if (latest.indexOf('&') != -1) latest = latest.substring(0, latest.indexOf('&'));

        return `channel=${channel}&ts=${ts}&latest=${latest}&inclusive=true&limit=1`;
    }

    function messageParameters(permalink) {
        const pathElements = permalink.substring(8).split('/');
        const channel = pathElements[2];

        var latest = pathElements[3].substring(1);
        if (latest.indexOf('?') != -1) latest = latest.substring(0, latest.indexOf('?'));
        latest = latest.substring(0, latest.length - 6) + '.' + latest.substring(latest.length - 6);
        return `channel=${channel}&latest=${latest}&inclusive=true&limit=1`;
    }

    async function user(id) {
        const response = await slack(`users.info`, `user=${id}`);
        return response.user;
    }

    async function slack(command, parameters, method) {
        const url = `https://slack.com/api/${command}?token=${process.env.slackToken}&${parameters}`;
        return await fetch(url, {
            method: method || "GET"
        })
            .then(r => r.json())
            .catch(err => context.log(err));
    }

    async function createCard(name, desc, due) {
        return await fetch("https://api.trello.com/1/cards", {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({
                token: process.env.trelloToken,
                key: process.env.trelloKey,
                idList: process.env.targetListID,
                name: name,
                desc: desc,
                due: due
            })
        }).catch(err => context.log(err));
    }

    async function complete(reminderId) {
        return await slack("reminders.complete", `reminder=${reminderId}`, "POST");
    }
};