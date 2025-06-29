#!/usr/bin/env node
/* eslint-disable no-undef */
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const BASE_URL = "https://www.aidedd.org/dnd-filters/monsters.php";
const MONSTER_URL = "https://www.aidedd.org/dnd/monstres.php?vo=";

async function fetchMonsterList() {
  const res = await axios.get(BASE_URL);
  const $ = cheerio.load(res.data);
  const monsters = [];
  $("table tbody tr").each((i, el) => {
    const tds = $(el).find("td");
    const name = $(tds[0]).text().trim();
    const type = $(tds[1]).text().trim();
    const cr = $(tds[2]).text().trim();
    const url =
      MONSTER_URL +
      name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/ /g, "-");
    monsters.push({ name, type, cr, url });
  });
  return monsters;
}

async function fetchStatblockImage(monsterUrl) {
  try {
    const res = await axios.get(monsterUrl);
    const $ = cheerio.load(res.data);
    // The statblock image is in an <img> with id 'imgstatblock' or similar
    const img = $('img[src*="statblock"]').attr("src");
    if (img) {
      return img.startsWith("http") ? img : "https://www.aidedd.org" + img;
    }
  } catch {
    // Ignore errors for missing monsters
  }
  return null;
}

async function main() {
  console.log("Fetching monster list...");
  const monsters = await fetchMonsterList();
  console.log(
    `Found ${monsters.length} monsters. Fetching statblock images...`
  );
  for (let i = 0; i < monsters.length; i++) {
    const m = monsters[i];
    process.stdout.write(
      `Fetching [${i + 1}/${monsters.length}]: ${m.name}...\r`
    );
    m.statblockImage = await fetchStatblockImage(m.url);
  }
  fs.writeFileSync("monsters.json", JSON.stringify(monsters, null, 2));
  console.log("\nDone! Saved to monsters.json");
}

main();
