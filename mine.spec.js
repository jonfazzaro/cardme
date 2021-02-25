jest.mock('./slack');
jest.mock('./trello');

const mine = require("./mine");
const slack = require("./slack");
const trello = require("./trello");

describe("The miner", () => {
    beforeEach(async () => {
        arrange(_mocked.reminders);
        await mine(_mocked.context);
    });

    it("creates a card for each reminder", () => {
        expect(_mocked.trello.createCard)
            .toHaveBeenCalledWith(
                "Respond to Mr. 12345",
                "> 234\n\nhttps://link.to.message/234",
                987654320000);

        expect(_mocked.trello.createCard)
            .toHaveBeenCalledWith(
                "Respond to Mr. 12345",
                "> 123\n\nhttps://link.to.message/123",
                987654321000);
    });

    it("marks each incomplete reminder complete", () => {
        expect(_mocked.slack.reminders.complete).toHaveBeenCalledWith(9876);
        expect(_mocked.slack.reminders.complete).toHaveBeenCalledWith(8765);
        expect(_mocked.slack.reminders.complete).not.toHaveBeenCalledWith(7654);
    });

    function arrange(reminders) {
        _mocked.trello.createCard.mockReturnValue(Promise.resolve());
        _mocked.slack.reminders.get.mockReturnValue(Promise.resolve({ reminders }));
        _mocked.slack.message.mockImplementation(url => {
            const tokens = url.split('/');
            const last = tokens[tokens.length - 1]
            return Promise.resolve({ text: last, user: 12345 });
        });
        _mocked.slack.user.mockImplementation(id => Promise.resolve({ real_name: `Mr. ${id}` }));
    }
});

const _mocked = {
    slack: {
        reminders: {
            get: jest.fn(),
            complete: jest.fn()
        },
        message: jest.fn(),
        user: jest.fn()
    },
    trello: { createCard: jest.fn() },
    context: { log: jest.fn(), done: jest.fn() },
    reminders: [
        {
            id: 9876,
            text: "https://link.to.message/123",
            complete_ts: 0,
            time: 987654321
        },
        {
            id: 8765,
            text: "https://link.to.message/234",
            complete_ts: 0,
            time: 987654320
        },
        {
            id: 7654,
            text: "https://link.to.message/345",
            complete_ts: 12345
        }
    ]
};

slack.mockReturnValue(_mocked.slack);
trello.mockReturnValue(_mocked.trello);
