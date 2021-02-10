const fetch = require("node-fetch");

function slack(context) {

    return {
        reminders: {
            get: get,
            complete: complete
        },
        message: message,
        user: user
    }

    async function get() {
        return await slack(`reminders.list`);
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

    async function complete(reminderId) {
        return await slack("reminders.complete", `reminder=${reminderId}`, "POST");
    }

    async function slack(command, parameters, method) {
        const url = `https://slack.com/api/${command}?token=${process.env.slackToken}&${parameters}`;
        return await fetch(url, {
            method: method || "GET"
        })
            .then(r => r.json())
            .catch(err => context.log(err));
    }

};

module.exports = slack;