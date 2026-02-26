report('Carding...');
Promise.all(laters().map(toTrelloCard)).then(reportResults).catch(reportError);

function toTrelloCard(element) {
  return addTrelloCard(parseMessage(element))
    .then((_) => completeReminder(element))
    .catch((err) => console.log(err));

  function addTrelloCard(message) {
    return fetch('https://api.trello.com/1/cards', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        token: process.env.trelloToken,
        key: process.env.trelloKey,
        idList: process.env.targetListID,
        name: 'Respond: ' + message.sender,
        desc: message.text,
        urlSource: message.url,
      }),
    });
  }

  function parseMessage(element) {
    return {
      sender: text(element, '.p-activity_ia4_page__item__senders'),
      text: '> ' + text(element, '.p-activity_ia4_page__item__message, .p-rich_text_section'),
      url: messageUrl(element.getAttribute('data-item-key')),
    };
  }

  function text(element, selector) {
    return element.querySelector(selector).innerText;
  }

  function messageUrl(key) {
    return 'https://' + 'opensesame' + '.slack.com/archives/' + key.split('_')[0].replace('-', '/p').replace('.', '');
  }

  function completeReminder(element) {
    element.querySelector("[aria-label='Mark complete']").click();
  }
}

function laters() {
  return Array.from(document.querySelectorAll('.p-saved_for_later_page__list_wrapper .c-virtual_list__item')).filter(
    (e) => !!e.querySelectorAll('.p-activity_ia4_page__item__message').length,
  );
}

function reportResults(cards) {
  report(results(cards));
}

function reportError(err) {
  report(err.message);
}

function results(cards) {
  const count = cards.length || 'No';
  return count + ' response cards added!';
}

function report(message) {
  document.title = message;
}
