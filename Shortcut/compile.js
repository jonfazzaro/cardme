const compressor = require('node-minify');
const encodeUrl = require("encodeurl");
const dotenv = require("dotenv");

dotenv.config();
main();

async function main() {
    await compressor.minify({
        compressor: 'terser',
        input: "./Shortcut/shortcut.js",
        output: "/dev/null",
    }).then(minified => {
        console.log("javascript:" + encodeUrl(withKeys(minified)));
    }).catch(err => console.error(err));
}

function withKeys(minified) {
    return minified.replace(/process\.env\.(\w+)/g,
        (_, key) => `"${process.env[key]}"`);
}
