jest.mock('node-fetch');

const mine = require("./mine");
const fetch = require("node-fetch");

fetch.mockImplementation(url => {
    console.log("fetch was called with URL " + url);
    return Promise.resolve({ json: () => { return { reminders: [] } } });
});

describe("The miner", () => {
    it("is under test", (done) => {
        mine({ done });
    });
});