#!/usr/bin/env node
/* eslint-disable no-undef */
const fs = require("fs");
const path = require("path");

// Load Open5e and AideDD monster data
const open5e = JSON.parse(fs.readFileSync("open5e_monsters.json", "utf8"));
const aidedd = JSON.parse(fs.readFileSync("monsters.json", "utf8"));

// Build a lookup for AideDD monsters by normalized name
const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
const aideddMap = {};
for (const m of aidedd) {
  aideddMap[normalize(m.name)] = m;
}

const combined = open5e.map((m) => {
  const normName = normalize(m.name);
  const aideddMatch = aideddMap[normName];
  return {
    name: m.name,
    type: m.type,
    cr: m.cr,
    statblockImage: aideddMatch ? aideddMatch.statblockImage : null,
    open5e: m,
  };
});

fs.writeFileSync("monsters_full.json", JSON.stringify(combined, null, 2));
console.log(
  `Done! Matched ${
    combined.filter((m) => m.statblockImage).length
  } monsters with statblock images out of ${combined.length}.`
);
