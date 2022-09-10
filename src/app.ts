import { readFileSync } from "fs";

import packageJson from "../package.json";

const banner = readFileSync("assets/banner.txt", { encoding: "utf8" });

console.log(banner);
console.log(`Version: [${packageJson.version}]\n`);
console.log(`${packageJson.description}\n`);

setInterval(() => {
    console.log(`${packageJson.displayName} is running.`);
}, 5_000);
