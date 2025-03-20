(function () {
    Promise.all(Array.from(document.querySelectorAll(".p-saved_for_later_page__list_wrapper .c-virtual_list__item"))
        .map(element => {
            const message = {
                sender: element.querySelector(".p-activity_ia4_page__item__senders").innerText,
                text: "> " + element.querySelector(".p-activity_ia4_page__item__message").innerText,
                url: "https://app.slack.com/client/" + process.env.slackClient + "/archives/" + element.getAttribute("data-item-key").split("_")[0].replace("-", "/p").replace(".", "")
            }

            return fetch("https://api.trello.com/1/cards", {
                headers: {"Content-Type": "application/json"},
                method: "POST",
                body: JSON.stringify({
                    token: process.env.trelloToken,
                    key: process.env.trelloKey,
                    idList: process.env.targetListID,
                    name: "Respond: " + message.sender,
                    desc: message.text,
                    // due: due,
                    urlSource: message.url,
                })
            })
                .then(res => {
                    element.querySelector("[aria-label='Mark complete']").click();
                    return message;
                })
                .catch(err => console.log(err));
        })).then(cards => {
        const count = cards.length || "No"
        alert(count + " response cards added!")
    })
}())
