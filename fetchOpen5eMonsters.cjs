#!/usr/bin/env node
/* eslint-disable no-undef */
const axios = require("axios");
const fs = require("fs");

const API_URL = "https://api.open5e.com/monsters/?limit=1000";

async function fetchAllMonsters() {
  let monsters = [];
  let url = API_URL;
  while (url) {
    const res = await axios.get(url);
    monsters = monsters.concat(res.data.results);
    url = res.data.next;
    if (url && url.startsWith("/")) url = "https://api.open5e.com" + url;
  }
  return monsters;
}

async function main() {
  console.log("Fetching monsters from Open5e...");
  const monsters = await fetchAllMonsters();
  fs.writeFileSync("open5e_monsters.json", JSON.stringify(monsters, null, 2));
  console.log(
    `Done! Saved ${monsters.length} monsters to open5e_monsters.json`
  );
}

main();
