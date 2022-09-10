import { readFileSync } from "fs";

import packageJson from "../package.json";

const banner = readFileSync("src/assets/banner.txt", { encoding: "utf8" });

console.log(banner);
console.log(`Version: [${packageJson.version}]\n`);
console.log(`${packageJson.description}\n`);

setInterval(() => {
    console.log(`${packageJson.displayName} is running.`);
}, 10_000); // print this message each 10 secondes.
