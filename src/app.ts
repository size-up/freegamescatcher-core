import { readFileSync } from "fs";

import packageJson from "../package.json";

import { EpicGamesService } from "./services/epicGames.service";

const banner = readFileSync("src/assets/banner.txt", { encoding: "utf8" });

console.log(banner);
console.log(`Version: [${packageJson.version}]\n`);
console.log(`${packageJson.description}\n`);

setInterval(() => {
    console.log(`${packageJson.displayName} is running.`);
}, 10_000); // print this message each 10 secondes.

const epicGames = new EpicGamesService();

console.log("Epic Games data:");
console.log(epicGames.getGames());
