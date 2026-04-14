report('Carding...');
Promise.all(laters().map(toTrelloCard)).then(reportResults).catch(reportError);

function toTrelloCard(element, env = process.env) {
  return addTrelloCard(parseMessage(element))
    .then((_) => completeReminder(element))
    .catch((err) => console.log(err));

  function addTrelloCard(message) {
    return fetch('https://api.trello.com/1/cards', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        token: env.trelloToken,
        key: env.trelloKey,
        idList: env.targetListID,
        name: 'Respond: ' + message.sender,
        desc: message.text,
        urlSource: message.url,
      }),
    });
  }

  function parseMessage(element) {
    return {
      sender: text(element, '[data-qa=message_sender_name]'),
      text: '> ' + text(element, '[data-qa=activity-item-message]'),
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
    (e) => !!e.querySelectorAll('[data-qa=activity-item-message]').length,
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
