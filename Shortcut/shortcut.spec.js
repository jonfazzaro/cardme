const { toTrelloCard } = require('./shortcut');

describe('toTrelloCard', () => {
  let fetchCalls;
  let env;

  beforeEach(() => {
    fetchCalls = [];
    global.fetch = (url, options) => {
      fetchCalls.push({ url, options });
      return Promise.resolve({ ok: true });
    };

    env = {
      trelloToken: 'test-token',
      trelloKey: 'test-key',
      targetListID: 'test-list-id',
    };
  });

  describe('given fetch rejects', () => {
    let logged;

    beforeEach(() => {
      logged = [];
      console.log = (msg) => logged.push(msg);
      global.fetch = () => Promise.reject(new Error('network failure'));
    });

    describe('when toTrelloCard is called', () => {
      it('logs the error', async () => {
        await toTrelloCard(fakeElement({ sender: 'Bob', message: 'Hi', itemKey: 'C1-1.1_x' }), env);
        expect(logged[0].message).toBe('network failure');
      });

      it('does not mark the reminder complete', async () => {
        let clicked = false;
        await toTrelloCard(fakeElement({ sender: 'Bob', message: 'Hi', itemKey: 'C1-1.1_x', onComplete: () => { clicked = true; } }), env);
        expect(clicked).toBe(false);
      });
    });
  });

  describe('given a valid Slack element', () => {
    let element;
    let clicked;

    beforeEach(() => {
      clicked = false;
      element = fakeElement({
        sender: 'Alice',
        message: 'Hello there',
        itemKey: 'C0GEQ4EK3-1234567890.123456_D0GEQ4EK3',
        onComplete: () => { clicked = true; },
      });
    });

    describe('when toTrelloCard is called', () => {
      beforeEach(() => toTrelloCard(element, env));

      it('posts to the Trello cards API', () => {
        expect(fetchCalls[0].url).toBe('https://api.trello.com/1/cards');
        expect(fetchCalls[0].options.method).toBe('POST');
      });

      it('sends Trello credentials from the environment', () => {
        const body = JSON.parse(fetchCalls[0].options.body);
        expect(body.token).toBe('test-token');
        expect(body.key).toBe('test-key');
        expect(body.idList).toBe('test-list-id');
      });

      it('names the card after the message sender', () => {
        const body = JSON.parse(fetchCalls[0].options.body);
        expect(body.name).toBe('Respond: Alice');
      });

      it('uses the message text as the card description', () => {
        const body = JSON.parse(fetchCalls[0].options.body);
        expect(body.desc).toBe('> Hello there');
      });

      it('sets the card source URL to the formatted Slack message permalink', () => {
        const body = JSON.parse(fetchCalls[0].options.body);
        expect(body.urlSource).toBe('https://opensesame.slack.com/archives/C0GEQ4EK3/p1234567890123456');
      });

      it('marks the reminder complete', () => {
        expect(clicked).toBe(true);
      });
    });
  });
});

function fakeElement({ sender, message, itemKey, onComplete = () => {} }) {
  return {
    getAttribute(attr) {
      if (attr === 'data-item-key') return itemKey;
    },
    querySelector(selector) {
      if (selector === '[data-qa=message_sender_name]') return { innerText: sender };
      if (selector === '[data-qa=activity-item-message]') return { innerText: message };
      if (selector === "[aria-label='Mark complete']") return { click: onComplete };
    },
  };
}
