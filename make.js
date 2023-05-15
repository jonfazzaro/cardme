const fn = require("./CardMe/index");
const dotenv = require("dotenv");

dotenv.config();
main();

async function main() {
    await fn({...console, done:()=>{}});
}

