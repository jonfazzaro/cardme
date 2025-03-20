import {minify} from "minify";
import encodeUrl from "encodeurl";
import dotenv from "dotenv";

dotenv.config();

console.log("javascript:" 
    + encodeUrl(
        withKeys(
            await minify("./CardMeShortcut/shortcut.js"))));

function withKeys(minified) {
    return minified.replace(/process\.env\.(\w+)/g,
        (_, key) => `"${process.env[key]}"`);
}
