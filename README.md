# D&D 5e Encounter Generator

A modern, web-based encounter generator for Dungeons & Dragons 5th Edition. Quickly create balanced, rules-compliant encounters using official monster data, with a clean and user-friendly interface.

## Features
- **Official 5e XP and CR rules**: Uses the official CR-to-XP mapping and encounter multipliers from the Dungeon Master's Guide.
- **Open5e Monster Data**: Loads over 3,000 monsters from the Open5e SRD database.
- **Smart Encounter Generation**: Generates random encounters based on party size, level, difficulty, and monster type, ensuring XP budgets match the selected difficulty.
- **Legendary Monster Logic**: Limits legendary monsters per encounter (max 1, or 2 for high-level parties, and only rarely).
- **Responsive, Modern UI**: Built with React and Vite, featuring block/card styling and a sidebar legend.
- **Statblock Modal**: View full monster statblocks in a modal popup.
- **XP Table and Explanations**: Always-visible XP threshold table and clear explanations for all summary fields.

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/betanight/encounter-generator.git
   cd encounter-generator
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or as indicated in your terminal).

### Build for Production
```sh
npm run build
```
The production-ready files will be in the `dist/` directory.

## Deployment
- The app is static and can be deployed to any static host (Render, Vercel, Netlify, GitHub Pages, etc.).
- Make sure the monster data files (`open5e_monsters.json`, etc.) are in the `public/` directory so they are accessible in production.

## Project Structure
```
encounter_generator/
├── public/
│   └── open5e_monsters.json      # Full Open5e monster data (used by the app)
├── src/
│   ├── App.jsx                   # Main React app, encounter logic, UI
│   ├── App.css                   # Main app styles
│   ├── index.css                 # Global styles
│   ├── main.jsx                  # React entry point
│   └── assets/                   # (Optional) Static assets
├── monsters_full.json            # (Legacy) Full monster data
├── monsters.json                 # (Legacy) Monster summary data
├── fetchOpen5eMonsters.cjs       # Script to fetch Open5e monsters
├── matchStatblocks.cjs           # Script to match statblocks
├── scrapeMonsters.cjs            # (Legacy) Scraper for monster names/types
├── package.json                  # Project metadata and scripts
├── vite.config.js                # Vite configuration
├── README.md                     # This file
└── ...
```

## How It Works
- **Encounter Generation**: Selects monsters of the chosen type, calculates total and adjusted XP, and ensures the encounter fits the selected difficulty for the party.
- **Difficulty Calculation**: Uses both official DMG thresholds and a custom XP ratio system for high-level accuracy.
- **Legendary Monster Handling**: Ensures only 1 legendary monster per encounter (2 for parties above level 15, and only rarely).
- **Statblocks**: All monster stats are sourced from Open5e and displayed in a modal.

## Notes
- No official monster artwork is included due to copyright restrictions.
- All monster data is sourced from [Open5e](https://open5e.com/).
- The app is designed for clarity, speed, and DM usability at the table.

---

Enjoy running smarter, faster, and more balanced D&D 5e encounters! 