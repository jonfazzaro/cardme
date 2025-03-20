Promise.all(laters().map(toTrelloCard)).then(reportResults);

function toTrelloCard(element) {
    return addTrelloCard(parseMessage(element))
        .then(res => completeReminder(element))
        .catch(err => console.log(err));

    function addTrelloCard(message) {
        return fetch("https://api.trello.com/1/cards", {
            headers: {"Content-Type": "application/json"},
            method: "POST",
            body: JSON.stringify({
                token: process.env.trelloToken,
                key: process.env.trelloKey,
                idList: process.env.targetListID,
                name: "Respond: " + message.sender,
                desc: message.text,
                urlSource: message.url,
            })
        });
    }

    function parseMessage(element) {
        return {
            sender: text(element, ".p-activity_ia4_page__item__senders"),
            text: "> " + text(element, ".p-activity_ia4_page__item__message"),
            url: messageUrl(element.getAttribute("data-item-key"))
        };
    }

    function text(element, selector) {
        return element.querySelector(selector).innerText;
    }

    function messageUrl(key) {
        return "https://" 
            + "excella"
            + ".slack.com/archives/"
            + key.split("_")[0].replace("-", "/p").replace(".", "");
    }

    function completeReminder(element) {
        element.querySelector("[aria-label='Mark complete']").click();
    }
}

function laters() {
    return Array.from(document.querySelectorAll(".p-saved_for_later_page__list_wrapper .c-virtual_list__item"));
}

function reportResults(cards) {
    const count = cards.length || "No"
    alert(count + " response cards added!")
}