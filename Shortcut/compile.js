const compressor = require('node-minify');
const encodeUrl = require('encodeurl');
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

async function minified(script) {
  await compressor
    .minify({
      compressor: 'uglify-es',
      content: script,
      // output: "/dev/null",
    })
    .then((minified) => {
      console.log('javascript:' + encodeUrl(withKeys(minified)));
    })
    .catch((err) => console.error(err));
}

function withKeys(minified) {
  return minified.replace(/process\.env\.(\w+)/g, (_, key) => `"${process.env[key]}"`);
}
