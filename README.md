# D&D 5e Encounter Generator

A modern, web-based encounter generator for Dungeons & Dragons 5th Edition. Quickly create balanced, rules-compliant encounters using official monster data, with a clean and user-friendly interface.

## Features
- **Official 5e XP and CR rules**: Uses the official CR-to-XP mapping and encounter multipliers from the Dungeon Master's Guide.
- **Open5e Monster Data**: Loads over 3,000 monsters from the Open5e SRD database.
- **Smart Encounter Generation**: Generates random encounters based on party size, level, difficulty, and monster type, ensuring XP budgets match the selected difficulty.
- **Legendary Monster Logic**: Limits legendary monsters per encounter (max 1, or 2 for high-level parties, and only rarely).
- **Responsive, Modern UI**: Built with React and Vite, featuring block/card styling and a sidebar legend.
- **Statblock Modal**: View full monster statblocks (with descriptions) in a modal popup.
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

### 1. Monster Data Loading
- On app startup, the full Open5e monster list is loaded from `public/open5e_monsters.json`.
- The app extracts all unique creature types to populate the "Creature Type" dropdown.

### 2. Encounter Generation
- The user selects creature type, party size, party level, and difficulty.
- When "Generate Encounter" is clicked:
  - The app filters monsters by the selected type.
  - It randomly selects 1-2 monsters for most encounters (90% of the time), or 3+ monsters for larger encounters (10% of the time, more likely at higher levels).
  - Legendary monsters are included only rarely (10-20% chance, and never more than 1 unless party level > 15, then up to 2).
  - The app calculates the total and adjusted XP (using official multipliers for multiple monsters).
  - The encounter is only accepted if the adjusted XP fits the selected difficulty's XP range for the party.

### 3. Legendary Monster Logic
- Legendary monsters are identified by the presence of `legendary_actions` in their statblock.
- Only 1 legendary monster is allowed per encounter (2 for parties above level 15, and only rarely).
- This prevents unbalanced or impossible encounters.

### 4. Statblock Modal with Description
- Each monster in the encounter has a "Statblock" button.
- Clicking it opens a modal showing the full statblock, including:
  - Name
  - **Description** (from the `desc` or `description` field, if available)
  - Type, CR, HP, AC, Speed, Abilities, Actions, Special Abilities, Legendary Actions, etc.

### 5. XP Table and Difficulty Ranges
- The sidebar always shows the XP thresholds for Easy, Medium, Hard, and Deadly encounters for the current party.
- The encounter summary shows both the selected and actual difficulty, with all relevant XP values.

### 6. No Monster Art
- No official monster artwork is included due to copyright restrictions.
- All monster data is sourced from [Open5e](https://open5e.com/).

## Notes
- The app is designed for clarity, speed, and DM usability at the table.
- You can easily extend or modify the logic for homebrew rules or custom monster data.

---

Enjoy running smarter, faster, and more balanced D&D 5e encounters! 