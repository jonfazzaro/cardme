const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();
main();

function readScript() {
  return withKeys(fs.readFileSync('./Shortcut/shortcut.js').toString());
}

async function main() {
  // const script = await minified();
  const script = readScript();
  console.log(script);
}

function withKeys(minified) {
  return minified.replace(/process\.env\.(\w+)/g, (_, key) => `"${process.env[key]}"`);
}
