jest.mock('node-fetch');

const mine = require("./mine");
const fetch = require("node-fetch");

describe("The miner", () => {
    it("is under test", (done) => {
        mocked.reminders = [{ complete_ts: 0 }, {}];
        mine({ done });
        expect(last.fetchedUrl).toContain("https://slack.com/api/reminders.list");
    });
});

const last = {};
const mocked = {
    reminders: []
};

fetch.mockImplementation((url, options) => {
    last.fetchedUrl = url;
    last.fetchedOptions = options;
    return Promise.resolve({ json: () => { return { reminders: mocked.reminders } } });
});