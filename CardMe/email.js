function email(context) {
    return {
        post
    }

    async function post(name, desc, due) {
        context.log("Mail sent:", name, desc, due);
    }
}

module.exports = email;