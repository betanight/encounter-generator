import React, { useEffect, useState } from 'react';
import './App.css';

function loadMonsters() {
  // Load from the static file generated earlier
  return fetch('/open5e_monsters.json').then(res => res.json());
}

const difficulties = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'deadly', label: 'Deadly' },
];

// Game modes
const gameModes = [
  { value: 'normal', label: 'Normal' },
  { value: 'dragonflight', label: 'Dragonflight' },
];

// Horde preferences
const hordePreferences = [
  { value: 'random', label: 'Random' },
  { value: 'horde', label: 'Horde' },
];

// Character XP by level (from D&D 5e rules)
const characterXPByLevel = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
};

// Dragonflight character XP by level (slow track)
const dragonflightCharacterXPByLevel = {
  1: 0,
  2: 2400,
  3: 7200,
  4: 21600,
  5: 52000,
  6: 112000,
  7: 184000,
  8: 272000,
  9: 384000,
  10: 512000,
  11: 680000,
  12: 800000,
  13: 960000,
  14: 1120000,
  15: 1320000,
  16: 1560000,
  17: 1800000,
  18: 2120000,
  19: 2440000,
  20: 2840000,
};

// Dragonflight encounter XP thresholds by level (scaled to match character progression)
const dragonflightEncounterThresholds = {
  1: { easy: 2000, medium: 4000, hard: 6000, deadly: 8000 },
  2: { easy: 4000, medium: 8000, hard: 12000, deadly: 16000 },
  3: { easy: 6000, medium: 12000, hard: 18000, deadly: 32000 },
  4: { easy: 10000, medium: 20000, hard: 30000, deadly: 40000 },
  5: { easy: 20000, medium: 40000, hard: 60000, deadly: 88000 },
  6: { easy: 24000, medium: 48000, hard: 72000, deadly: 112000 },
  7: { easy: 30000, medium: 60000, hard: 88000, deadly: 136000 },
  8: { easy: 36000, medium: 72000, hard: 112000, deadly: 168000 },
  9: { easy: 44000, medium: 88000, hard: 128000, deadly: 192000 },
  10: { easy: 48000, medium: 96000, hard: 152000, deadly: 224000 },
  11: { easy: 64000, medium: 128000, hard: 192000, deadly: 288000 },
  12: { easy: 80000, medium: 160000, hard: 240000, deadly: 360000 },
  13: { easy: 88000, medium: 176000, hard: 272000, deadly: 408000 },
  14: { easy: 100000, medium: 200000, hard: 304000, deadly: 456000 },
  15: { easy: 112000, medium: 224000, hard: 344000, deadly: 512000 },
  16: { easy: 128000, medium: 256000, hard: 384000, deadly: 576000 },
  17: { easy: 160000, medium: 312000, hard: 472000, deadly: 704000 },
  18: { easy: 168000, medium: 336000, hard: 504000, deadly: 760000 },
  19: { easy: 192000, medium: 392000, hard: 584000, deadly: 872000 },
  20: { easy: 224000, medium: 456000, hard: 680000, deadly: 1016000 },
};

// Official CR to XP mapping
const crToXp = {
  '0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800, '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900, '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000, '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000, '21': 33000, '22': 41000, '23': 50000, '24': 62000, '25': 75000, '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000
};

// Encounter multipliers (DMG) - Updated for horde mechanics
const encounterMultipliers = [
  { count: 1, mult: 1 },
  { count: 2, mult: 1.5 },
  { count: 3, mult: 2 },
  { count: 4, mult: 2.5 },
  { count: 5, mult: 3 },
  { count: 6, mult: 3.5 },
  { count: 7, mult: 4 },
  { count: 8, mult: 4.5 },
];

// New difficulty calculation based on party XP vs monster XP ratio
function calculateDifficulty(partyLevel, partySize, monsterXP, gameMode = 'normal') {
  if (gameMode === 'dragonflight') {
    // For Dragonflight, use the fixed thresholds multiplied by party size
    const thresholds = dragonflightEncounterThresholds[partyLevel];
    const easyThreshold = thresholds.easy * partySize;
    const mediumThreshold = thresholds.medium * partySize;
    const hardThreshold = thresholds.hard * partySize;
    const deadlyThreshold = thresholds.deadly * partySize;
    
    if (monsterXP <= easyThreshold) return 'easy';
    if (monsterXP <= mediumThreshold) return 'medium';
    if (monsterXP <= hardThreshold) return 'hard';
    if (monsterXP <= deadlyThreshold) return 'deadly';
    return 'deadly'; // Anything above deadly threshold is still deadly
  } else {
    // Standard D&D 5e calculation
    const partyTotalXP = characterXPByLevel[partyLevel] * partySize;
    const ratio = monsterXP / partyTotalXP;
    
    // Define difficulty thresholds based on ratio
    if (ratio < 0.3) return 'easy';
    if (ratio < 0.6) return 'medium';
    if (ratio < 1.0) return 'hard';
    return 'deadly';
  }
}

// Get difficulty range for a given party
function getDifficultyRange(partyLevel, partySize, gameMode = 'normal') {
  if (gameMode === 'dragonflight') {
    // Use Dragonflight's fixed thresholds multiplied by party size
    const thresholds = dragonflightEncounterThresholds[partyLevel];
    return {
      easy: thresholds.easy * partySize,
      medium: thresholds.medium * partySize,
      hard: thresholds.hard * partySize,
      deadly: thresholds.deadly * partySize
    };
  } else {
    // Use standard D&D 5e calculation
    const partyTotalXP = characterXPByLevel[partyLevel] * partySize;
    return {
      easy: Math.round(partyTotalXP * 0.3),
      medium: Math.round(partyTotalXP * 0.6),
      hard: Math.round(partyTotalXP * 1.0),
      deadly: Math.round(partyTotalXP * 1.5)
    };
  }
}

function getMultiplier(count) {
  // For small groups (1-8), use standard D&D multipliers
  for (let i = encounterMultipliers.length - 1; i >= 0; i--) {
    if (count >= encounterMultipliers[i].count) return encounterMultipliers[i].mult;
  }
  
  // For larger groups (9+), use horde mechanics: +0.1x per 5 creatures, capped at 100 creatures (3.0x)
  if (count >= 9) {
    const hordeMultiplier = Math.min(3.0, 1.0 + (Math.floor(count / 5) * 0.1));
    return hordeMultiplier;
  }
  
  return 1;
}

function statMod(stat) {
  return Math.floor((stat - 10) / 2);
}

function formatSpeed(speed) {
  if (typeof speed === 'object') {
    return Object.entries(speed).map(([k, v]) => `${k}: ${v}`).join(', ');
  }
  return speed;
}

function formatAC(ac) {
  if (typeof ac === 'object') {
    if (Array.isArray(ac)) {
      return ac.map(a => (typeof a === 'object' ? a.value : a)).join(', ');
    }
    return ac.value || JSON.stringify(ac);
  }
  return ac;
}

function formatSave(val, stat) {
  if (val !== null && val !== undefined) return (val >= 0 ? '+' : '') + val;
  const mod = statMod(stat);
  return (mod >= 0 ? '+' : '') + mod;
}

function StatblockModal({ monster, onClose }) {
  if (!monster) return null;
  const m = monster.monster;
  const description = m.desc || m.description || '';
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>{m.name}</h2>
        
        {description && <div className="monster-desc">{description}</div>}
        
        <div className="statblock-section">
          <h3>Basic Information</h3>
          <div className="basic-info">
            <div>
              <strong>Type</strong>
              <span>{m.type}</span>
            </div>
            <div>
              <strong>Challenge Rating</strong>
              <span>{m.cr}</span>
            </div>
            <div>
              <strong>Hit Points</strong>
              <span>{m.hit_points} ({m.hit_dice})</span>
            </div>
            <div>
              <strong>Armor Class</strong>
              <span>{formatAC(m.armor_class)}</span>
            </div>
            <div>
              <strong>Speed</strong>
              <span>{formatSpeed(m.speed)}</span>
            </div>
            {m.senses && (
              <div>
                <strong>Senses</strong>
                <span>{m.senses}</span>
              </div>
            )}
            {m.languages && (
              <div>
                <strong>Languages</strong>
                <span>{m.languages}</span>
              </div>
            )}
          </div>
        </div>

        <div className="statblock-section">
          <h3>Ability Scores</h3>
          <div className="abilities-grid">
            <div className="ability-score">
              <strong>STR</strong>
              <span className="score">{m.strength}</span>
              <span className="modifier">({formatSave(m.strength_save, m.strength)})</span>
            </div>
            <div className="ability-score">
              <strong>DEX</strong>
              <span className="score">{m.dexterity}</span>
              <span className="modifier">({formatSave(m.dexterity_save, m.dexterity)})</span>
            </div>
            <div className="ability-score">
              <strong>CON</strong>
              <span className="score">{m.constitution}</span>
              <span className="modifier">({formatSave(m.constitution_save, m.constitution)})</span>
            </div>
            <div className="ability-score">
              <strong>INT</strong>
              <span className="score">{m.intelligence}</span>
              <span className="modifier">({formatSave(m.intelligence_save, m.intelligence)})</span>
            </div>
            <div className="ability-score">
              <strong>WIS</strong>
              <span className="score">{m.wisdom}</span>
              <span className="modifier">({formatSave(m.wisdom_save, m.wisdom)})</span>
            </div>
            <div className="ability-score">
              <strong>CHA</strong>
              <span className="score">{m.charisma}</span>
              <span className="modifier">({formatSave(m.charisma_save, m.charisma)})</span>
            </div>
          </div>
        </div>

        {m.proficiencies && m.proficiencies.length > 0 && (
          <div className="statblock-section">
            <h3>Proficiencies</h3>
            <div className="basic-info">
              <div>
                <strong>Proficiencies</strong>
                <span>{m.proficiencies.map(p => p.proficiency.name).join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        {m.special_abilities && m.special_abilities.length > 0 && (
          <div className="statblock-section">
            <h3>Special Abilities</h3>
            <ul className="trait-list">
              {m.special_abilities.map((a, i) => (
                <li key={i}>
                  <strong>{a.name}</strong>
                  <span>{a.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {m.actions && m.actions.length > 0 && (
          <div className="statblock-section">
            <h3>Actions</h3>
            <ul className="action-list">
              {m.actions.map((a, i) => (
                <li key={i}>
                  <strong>{a.name}</strong>
                  <span>{a.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {m.legendary_actions && m.legendary_actions.length > 0 && (
          <div className="statblock-section">
            <h3>Legendary Actions</h3>
            <ul className="legendary-list">
              {m.legendary_actions.map((a, i) => (
                <li key={i}>
                  <strong>{a.name}</strong>
                  <span>{a.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {m.horde_traits && m.horde_traits.length > 0 && (
          <div className="statblock-section">
            <h3>Horde Traits</h3>
            <ul className="horde-list">
              {m.horde_traits.map((t, i) => (
                <li key={i}>
                  <strong>{t.name}</strong>
                  <span>{t.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function getMonsterXP(cr) {
  if (crToXp[cr]) return crToXp[cr];
  // Try to parse as a number
  const n = Number(cr);
  if (!isNaN(n) && crToXp[String(n)]) return crToXp[String(n)];
  return 0;
}

function getAdjustedXP(monsters) {
  const total = monsters.reduce((sum, m) => {
    // Use originalQuantity for hordes, quantity for regular creatures
    const actualQuantity = m.originalQuantity || m.quantity;
    return sum + getMonsterXP(m.monster.cr) * actualQuantity;
  }, 0);
  const count = monsters.reduce((sum, m) => {
    // Use originalQuantity for hordes, quantity for regular creatures
    const actualQuantity = m.originalQuantity || m.quantity;
    return sum + actualQuantity;
  }, 0);
  const mult = getMultiplier(count);
  return Math.round(total * mult);
}

function createHorde(monster, quantity) {
  if (quantity < 5) return null; // Not enough for a horde (minimum 5)
  
  // Round down to nearest multiple of 5
  const hordeQuantity = Math.floor(quantity / 5) * 5;
  
  // Calculate damage multiplier for horde
  const damageMultiplier = Math.floor(hordeQuantity / 2);
  
  // Modify actions to show horde damage
  const modifiedActions = monster.actions ? monster.actions.map(action => ({
    ...action,
    desc: action.desc.replace(/(\d+d\d+\+?\d*)/g, `$1 (HORDE: ×${damageMultiplier} damage)`)
  })) : [];
  
  const horde = {
    ...monster,
    name: `${monster.name} Horde`,
    type: 'horde creature',
    horde_count: hordeQuantity,
    hit_points: monster.hit_points * hordeQuantity,
    hit_dice: `${monster.hit_dice.split('d')[0] * hordeQuantity}d${monster.hit_dice.split('d')[1]}`,
    // Horde CR calculation - more gradual increase
    cr: Math.min(parseFloat(monster.cr) + Math.floor(hordeQuantity / 10), 30),
    // Modified actions with horde damage
    actions: modifiedActions,
    // Add horde traits
    horde_traits: [
      {
        name: 'Collective Resistance',
        desc: `When the horde would be subjected to an effect that would cause it to suffer the charmed, frightened, paralyzed, petrified, prone, restrained, stunned, or unconscious condition, it may lose a number of hit points equal to one tenth its hit point maximum (rounded down) to instead be immune to the effect.`
      },
      {
        name: 'Horde',
        desc: `The horde has ${hordeQuantity} creatures within it. The horde can occupy another creature's space and vice versa, and the horde can move through any opening large enough for a single creature within the horde.`
      },
      {
        name: 'Overwhelming Assault',
        desc: `The horde multiplies any damage it deals by ${damageMultiplier} (half the number of creatures within the horde, rounded down). Additionally, when the horde makes an attack and misses, it instead hits but deals reduced damage. If it misses the target's AC by 1–4, the damage is not reduced. If it misses the target's AC by 5–9, the horde deals half damage (rounded down). If it misses the target's AC by 10–14, it deals one-quarter damage (rounded down). If it misses the target's AC by 15 or more, it deals one-tenth damage (rounded down).`
      }
    ]
  };
  
  return horde;
}

function fillXPGap(encounter, targetXP, pool, partyLevel, gameMode = 'normal', hordePreference = 'random') {
  const currentXP = getAdjustedXP(encounter);
  const gap = targetXP - currentXP;
  
  if (gap <= 0) return encounter;
  
  // Find creatures relative to party level for "low level" horde creatures
  const creaturesByCR = pool
    .map(m => ({ ...m, crValue: parseFloat(m.cr) || 0 }))
    .sort((a, b) => a.crValue - b.crValue);
  
  if (creaturesByCR.length === 0) return encounter;
  
  // Define "low level" relative to party level
  const lowLevelThreshold = Math.max(1, Math.floor(partyLevel / 3)); // Party level / 3
  const midLevelThreshold = Math.max(3, Math.floor(partyLevel / 2)); // Party level / 2
  const highLevelThreshold = Math.max(6, Math.floor(partyLevel * 0.7)); // Party level * 0.7
  
  console.log(`Party Level ${partyLevel}: Low CR ≤${lowLevelThreshold}, Mid CR ≤${midLevelThreshold}, High CR ≤${highLevelThreshold}`);
  
  // Create a varied encounter to fill the gap
  let currentGap = gap;
  const maxAdditionalCreatures = Math.min(5, creaturesByCR.length); // Add up to 5 different creature types
  
  // Add 1-3 different creature types to fill the gap
  const numCreatureTypes = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < numCreatureTypes && currentGap > 0 && i < maxAdditionalCreatures; i++) {
    // Pick a random creature from different CR ranges relative to party level
    let selectedCreature;
    const rand = Math.random();
    
    if (rand < 0.5) {
      // 50% chance for very low CR (relative to party level)
      const lowCR = creaturesByCR.filter(m => m.crValue <= lowLevelThreshold);
      selectedCreature = lowCR[Math.floor(Math.random() * lowCR.length)];
    } else if (rand < 0.8) {
      // 30% chance for low CR (relative to party level)
      const midCR = creaturesByCR.filter(m => m.crValue > lowLevelThreshold && m.crValue <= midLevelThreshold);
      selectedCreature = midCR[Math.floor(Math.random() * midCR.length)];
    } else {
      // 20% chance for medium CR (relative to party level)
      const highCR = creaturesByCR.filter(m => m.crValue > midLevelThreshold && m.crValue <= highLevelThreshold);
      selectedCreature = highCR[Math.floor(Math.random() * highCR.length)];
    }
    
    if (!selectedCreature) continue;
    
    const creatureXP = getMonsterXP(selectedCreature.cr);
    const maxQuantity = Math.floor(currentGap / creatureXP);
    
    if (maxQuantity <= 0) continue;
    
    // Determine quantity - adjust based on game mode and horde preference
    let quantity;
    if (maxQuantity <= 4) {
      quantity = maxQuantity;
    } else {
      // Different random factors based on game mode and horde preference
      let randomFactor;
      if (gameMode === 'dragonflight' && hordePreference === 'horde') {
        // Dragonflight horde: More conservative to avoid overshooting
        randomFactor = 0.5 + (Math.random() * 0.3); // 50-80% of max
      } else if (gameMode === 'dragonflight') {
        // Dragonflight random: More aggressive
        randomFactor = 0.7 + (Math.random() * 0.3); // 70-100% of max
      } else {
        // Normal mode: Conservative
        randomFactor = 0.5 + (Math.random() * 0.4); // 50-90% of max
      }
      quantity = Math.floor(maxQuantity * randomFactor);
    }
    
    // Round to nearest multiple of 5 for horde mechanics if quantity is large
    const hordeQuantity = quantity >= 5 ? Math.floor(quantity / 5) * 5 : quantity;
    
    // Ensure horde quantity is always divisible by 5
    const finalHordeQuantity = hordeQuantity >= 5 ? Math.floor(hordeQuantity / 5) * 5 : hordeQuantity;
    
    if (finalHordeQuantity >= 5) {
      const horde = createHorde(selectedCreature, finalHordeQuantity);
      if (horde) {
        encounter.push({
          name: horde.name,
          quantity: 1, // Horde is treated as single entity
          monster: horde,
          isHorde: true,
          originalQuantity: finalHordeQuantity
        });
        currentGap -= getMonsterXP(selectedCreature.cr) * finalHordeQuantity;
      }
    } else if (finalHordeQuantity > 0) {
      encounter.push({
        name: selectedCreature.name,
        quantity: finalHordeQuantity,
        monster: selectedCreature
      });
      currentGap -= getMonsterXP(selectedCreature.cr) * finalHordeQuantity;
    }
  }
  
  return encounter;
}

function App() {
  const [monsters, setMonsters] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [partySize, setPartySize] = useState(4);
  const [partyLevel, setPartyLevel] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [gameMode, setGameMode] = useState('normal');
  const [hordePreference, setHordePreference] = useState('random');
  const [encounter, setEncounter] = useState([]);
  const [showStatblock, setShowStatblock] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadMonsters().then(data => {
      setMonsters(data);
      const uniqueTypes = Array.from(new Set(data.map(m => m.type))).sort();
      setTypes(uniqueTypes);
      setSelectedType(uniqueTypes[0] || '');
    });
  }, []);

  function generateEncounter() {
    let pool = monsters.filter(m => m.type === selectedType);
    
    // For deadly encounters, try to use legendary creatures
    const isLegendary = m => Array.isArray(m.legendary_actions) && m.legendary_actions.length > 0;
    
    if (difficulty === 'deadly') {
      const legendaryPool = pool.filter(isLegendary);
      
      if (legendaryPool.length > 0) {
        // Check if any legendary creatures are affordable
        const difficultyRange = getDifficultyRange(partyLevel, partySize, gameMode);
        const targetXP = difficultyRange[difficulty];
        
        // Check if even the lowest CR legendary creature would be too expensive
        const lowestCRLegendary = legendaryPool.reduce((lowest, m) => {
          const xp = getMonsterXP(m.cr);
          return xp < lowest ? xp : lowest;
        }, Infinity);
        
                 if (lowestCRLegendary <= targetXP * 1.5) {
           // Use legendary creatures if they're affordable
           pool = legendaryPool;
         } else {
          // If legendary creatures are too expensive, fall back to regular creatures
          console.log(`Note: No affordable legendary creatures found for ${partyLevel}th level party. Using regular creatures for deadly encounter.`);
        }
      } else {
        // No legendary creatures available, use regular creatures
        console.log(`Note: No legendary creatures found for ${selectedType}. Using regular creatures for deadly encounter.`);
      }
    }
    
    const difficultyRange = getDifficultyRange(partyLevel, partySize, gameMode);
    const targetXP = difficultyRange[difficulty];

    // Determine monster count with more variety for interesting encounters
    let maxMonsters;
    const rand = Math.random();
    if (rand < 0.4) {
      maxMonsters = 1; // 40% chance for single creature
    } else if (rand < 0.7) {
      maxMonsters = 2; // 30% chance for 2 creatures
    } else if (rand < 0.9) {
      maxMonsters = 3; // 20% chance for 3 creatures
    } else {
      maxMonsters = partyLevel >= 8 ? 5 : 4; // 10% chance for 4-5 creatures
    }

    // Legendary monster rules - hard cap at 3 total legendary creatures

    // Try more times for Dragonflight to find valid encounters
    const maxAttempts = gameMode === 'dragonflight' ? 2000 : 1000;
    let best = null;
    console.log(`Attempting to generate encounter with ${pool.length} monsters available`);
    for (let tries = 0; tries < maxAttempts; tries++) {
      let result = [];
      let count = Math.floor(Math.random() * maxMonsters) + 1;
      let used = new Set();
      for (let i = 0; i < count; i++) {
        let idx, m;
        let attempts = 0;
        do {
          if (hordePreference === 'horde') {
            // For horde mode, prefer lower CR creatures (minions)
            const lowCRCreatures = pool.filter(creature => {
              const cr = parseFloat(creature.cr) || 0;
              return cr <= partyLevel / 2; // Prefer creatures with CR <= half party level
            });
            
            if (lowCRCreatures.length > 0 && Math.random() < 0.7) {
              // 70% chance to pick from low CR creatures
              idx = pool.indexOf(lowCRCreatures[Math.floor(Math.random() * lowCRCreatures.length)]);
            } else {
              // 30% chance to pick from all creatures
              idx = Math.floor(Math.random() * pool.length);
            }
          } else {
            idx = Math.floor(Math.random() * pool.length);
          }
          m = pool[idx];
          attempts++;
        } while (
          (used.has(idx) && used.size < pool.length) ||
          (isLegendary(m) && attempts < 20) ||
          (attempts < 50 && result.some(r => r.monster.name === m.name)) // Avoid duplicates in same encounter
        );
        used.add(idx);
        // Weighted random quantities based on game mode and horde preference
        let quantity;
        const rand = Math.random();
        
        if (hordePreference === 'horde') {
          // Horde mode: Generate hordes appropriate for difficulty and game mode
          if (gameMode === 'dragonflight') {
            // Dragonflight hordes: More conservative to match difficulty targets
            if (rand < 0.2) {
              // 20% chance for 5-15 (small hordes)
              quantity = Math.floor(Math.random() * 11) + 5;
            } else if (rand < 0.5) {
              // 30% chance for 15-30 (medium hordes)
              quantity = Math.floor(Math.random() * 16) + 15;
            } else if (rand < 0.8) {
              // 30% chance for 30-50 (large hordes)
              quantity = Math.floor(Math.random() * 21) + 30;
            } else {
              // 20% chance for 50-100 (massive hordes)
              quantity = Math.floor(Math.random() * 51) + 50;
            }
          } else {
            // Normal mode hordes: Can be larger since targets are lower
            if (rand < 0.1) {
              // 10% chance for 20-50 (small hordes)
              quantity = Math.floor(Math.random() * 31) + 20;
            } else if (rand < 0.3) {
              // 20% chance for 50-100 (medium hordes)
              quantity = Math.floor(Math.random() * 51) + 50;
            } else if (rand < 0.6) {
              // 30% chance for 100-200 (large hordes)
              quantity = Math.floor(Math.random() * 101) + 100;
            } else if (rand < 0.8) {
              // 20% chance for 200-500 (massive hordes)
              quantity = Math.floor(Math.random() * 301) + 200;
            } else {
              // 20% chance for 500-1000 (army-scale hordes)
              quantity = Math.floor(Math.random() * 501) + 500;
            }
          }
        } else if (gameMode === 'dragonflight') {
          // Dragonflight Random: Favor larger groups and hordes to reach high XP targets
          if (rand < 0.3) {
            // 30% chance for 1-3 (small groups)
            quantity = Math.floor(Math.random() * 3) + 1;
          } else if (rand < 0.5) {
            // 20% chance for 4-8 (medium groups)
            quantity = Math.floor(Math.random() * 5) + 4;
          } else if (rand < 0.7) {
            // 20% chance for 8-20 (large groups)
            quantity = Math.floor(Math.random() * 13) + 8;
          } else if (rand < 0.9) {
            // 20% chance for 20-50 (hordes)
            quantity = Math.floor(Math.random() * 31) + 20;
          } else {
            // 10% chance for 50-100 (massive hordes)
            quantity = Math.floor(Math.random() * 51) + 50;
          }
        } else {
          // Normal mode: More conservative quantities
          if (rand < 0.5) {
            // 50% chance for 1-3 (small groups)
            quantity = Math.floor(Math.random() * 3) + 1;
          } else if (rand < 0.75) {
            // 25% chance for 4-8 (medium groups)
            quantity = Math.floor(Math.random() * 5) + 4;
          } else if (rand < 0.9) {
            // 15% chance for 8-15 (large groups)
            quantity = Math.floor(Math.random() * 8) + 8;
          } else if (rand < 0.98) {
            // 8% chance for 15-30 (hordes)
            quantity = Math.floor(Math.random() * 16) + 15;
          } else {
            // 2% chance for 30-50 (massive hordes)
            quantity = Math.floor(Math.random() * 21) + 30;
          }
        }
        
        // Ensure quantity is divisible by 5 for hordes
        const finalQuantity = quantity >= 5 ? Math.floor(quantity / 5) * 5 : quantity;
        
        result.push({
          name: m.name,
          quantity: finalQuantity,
          monster: m
        });
      }
      // Don't allow more than maxLegendaries total individual legendary creatures
      const totalLegendaryCount = result.reduce((sum, m) => 
        sum + (isLegendary(m.monster) ? m.quantity : 0), 0
      );
      if (totalLegendaryCount > 3) continue; // Hard cap at 3 total legendary creatures
      
      // Check total monster count to avoid excessive encounters
      const totalMonsterCount = result.reduce((sum, m) => sum + m.quantity, 0);
      if (totalMonsterCount > 200) continue; // Cap at 200 total monsters (allows for massive hordes)
      
      // Prefer encounters with fewer total monsters (50% chance to reject if > 50)
      if (totalMonsterCount > 50 && Math.random() < 0.5) continue;
      
      const adjXP = getAdjustedXP(result);
      // Use different ranges based on game mode
      const minXP = gameMode === 'dragonflight' ? targetXP * 0.95 : targetXP * 0.85;
      const maxXP = gameMode === 'dragonflight' ? targetXP * 1.05 : targetXP * 1.15;
      
      if (adjXP >= minXP && adjXP <= maxXP) {
        best = result;
        break;
      }
      // Save the closest one
      if (!best || Math.abs(getAdjustedXP(best) - targetXP) > Math.abs(adjXP - targetXP)) {
        best = result;
      }
    }
    
    // If no encounter found, try with relaxed constraints
    if (!best || best.length === 0) {
      console.log("No encounter found with strict constraints, trying with relaxed constraints...");
      const relaxedAttempts = gameMode === 'dragonflight' ? 1000 : 500;
      for (let tries = 0; tries < relaxedAttempts; tries++) {
        let result = [];
        let count = Math.floor(Math.random() * 3) + 1; // Simpler monster count
        let used = new Set();
        for (let i = 0; i < count; i++) {
          let idx = Math.floor(Math.random() * pool.length);
          let m = pool[idx];
          used.add(idx);
          // Allow much larger quantities for hordes in relaxed mode
          let quantity = Math.floor(Math.random() * 50) + 1; // 1-50 for relaxed mode
          result.push({
            name: m.name,
            quantity: quantity,
            monster: m
          });
        }
        
        const adjXP = getAdjustedXP(result);
        // Use different ranges based on game mode for relaxed constraints
        const minXP = gameMode === 'dragonflight' ? targetXP * 0.9 : targetXP * 0.7;
        const maxXP = gameMode === 'dragonflight' ? targetXP * 1.1 : targetXP * 1.3;
        
        if (adjXP >= minXP && adjXP <= maxXP) {
          best = result;
          console.log("Found encounter with relaxed constraints");
          break;
        }
        if (!best || Math.abs(getAdjustedXP(best) - targetXP) > Math.abs(adjXP - targetXP)) {
          best = result;
        }
      }
    }
    
    // Convert groups of 5+ into hordes and fill XP gaps
    let processedEncounter = best.map(encounterMonster => {
      if (encounterMonster.quantity >= 5) {
        const horde = createHorde(encounterMonster.monster, encounterMonster.quantity);
        if (horde) {
          return {
            name: horde.name,
            quantity: 1, // Horde is treated as single entity
            monster: horde,
            isHorde: true,
            originalQuantity: encounterMonster.quantity
          };
        }
      }
      return encounterMonster;
    });
    
    // Fill XP gaps with low-level creatures (relative to party level)
    const currentXP = getAdjustedXP(processedEncounter);
    const gapThreshold = gameMode === 'dragonflight' ? 0.9 : 0.7; // Much more aggressive gap filling for Dragonflight
    const fillTarget = gameMode === 'dragonflight' ? targetXP * 0.98 : targetXP * 0.9; // Fill very close to target for Dragonflight
    
    if (currentXP < targetXP * gapThreshold) {
      processedEncounter = fillXPGap(processedEncounter, fillTarget, pool, partyLevel, gameMode, hordePreference);
    }
    
    setEncounter(processedEncounter);
    
    // Prepare summary with new calculation
    if (processedEncounter && processedEncounter.length > 0) {
      const totalXP = processedEncounter.reduce((sum, m) => {
        const actualQuantity = m.originalQuantity || m.quantity;
        return sum + getMonsterXP(m.monster.cr) * actualQuantity;
      }, 0);
      const adjXP = getAdjustedXP(processedEncounter);
      const characterXP = gameMode === 'dragonflight' ? dragonflightCharacterXPByLevel : characterXPByLevel;
      const partyTotalXP = characterXP[partyLevel] * partySize;
      const actualDifficulty = calculateDifficulty(partyLevel, partySize, adjXP, gameMode);
      
      setSummary({
        partySize,
        partyLevel,
        partyTotalXP,
        difficulty,
        targetXP,
        totalXP,
        adjXP,
        monsterCount: processedEncounter.reduce((sum, m) => sum + (m.originalQuantity || m.quantity), 0),
        actualDifficulty,
        difficultyRange
      });
    } else {
      setSummary(null);
    }
  }

  // Legend explanations
  const legend = [
    { label: 'Party Size', desc: 'Number of player characters in the party.' },
    { label: 'Party Level', desc: 'Average level of the party.' },
    { label: 'Party Total XP', desc: 'Sum of all characters\' XP at their level.' },
    { label: 'Difficulty', desc: 'Selected encounter difficulty (Easy, Medium, Hard, Deadly).' },
    { label: 'Target XP', desc: 'XP budget for the selected difficulty based on party XP ratio.' },
    { label: 'Total XP', desc: 'Sum of XP for all monsters in the encounter.' },
    { label: 'Adjusted XP (with multiplier)', desc: 'Total XP after applying the official multiplier for multiple monsters.' },
    { label: 'Actual Difficulty', desc: 'Calculated difficulty based on monster XP vs party XP ratio.' },
    { label: 'Monster Count', desc: 'Total number of monsters in the encounter.' },
  ];

  const difficultyRange = getDifficultyRange(partyLevel, partySize, gameMode);
  const characterXP = gameMode === 'dragonflight' ? dragonflightCharacterXPByLevel : characterXPByLevel;
  const partyTotalXP = characterXP[partyLevel] * partySize;

  return (
    <div className="app-main-layout">
      <aside className="legend-sidebar">
        <h3>Legend</h3>
        <ul className="legend-list">
          {legend.map((item, i) => (
            <li key={i} className="legend-item">
              <strong>{item.label}:</strong> 
              <span>{item.desc}</span>
            </li>
          ))}
        </ul>
        
        <div className="difficulty-ranges">
          <h4>Difficulty Ranges for Party</h4>
          <div><strong>Party Total XP:</strong> {partyTotalXP.toLocaleString()}</div>
          <div><strong>Easy:</strong> 0 - {difficultyRange.easy.toLocaleString()} XP</div>
          <div><strong>Medium:</strong> {difficultyRange.easy.toLocaleString()} - {difficultyRange.medium.toLocaleString()} XP</div>
          <div><strong>Hard:</strong> {difficultyRange.medium.toLocaleString()} - {difficultyRange.hard.toLocaleString()} XP</div>
          <div><strong>Deadly:</strong> {difficultyRange.hard.toLocaleString()} - {difficultyRange.deadly.toLocaleString()} XP</div>
          {gameMode === 'dragonflight' && (
            <div className="dragonflight-note">
              <em>Dragonflight mode: Thresholds are per character × {partySize} party members</em>
            </div>
          )}
        </div>
      </aside>
      
      <div className="app-container">
        <h1>D&D 5e Encounter Generator</h1>
        
        <div className="game-mode-toggle">
          <h3>Game Mode</h3>
          <div className="mode-buttons">
            {gameModes.map(mode => (
              <button
                key={mode.value}
                className={`mode-btn ${gameMode === mode.value ? 'active' : ''}`}
                onClick={() => setGameMode(mode.value)}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="horde-preference-toggle">
          <h3>Encounter Style</h3>
          <div className="mode-buttons">
            {hordePreferences.map(pref => (
              <button
                key={pref.value}
                className={`mode-btn ${hordePreference === pref.value ? 'active' : ''}`}
                onClick={() => setHordePreference(pref.value)}
              >
                {pref.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="controls">
          <label>
            Creature Type:
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
              {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label>
            Party Size:
            <input type="number" min={1} max={10} value={partySize} onChange={e => setPartySize(e.target.value)} />
          </label>
          <label>
            Party Level:
            <input type="number" min={1} max={20} value={partyLevel} onChange={e => setPartyLevel(e.target.value)} />
          </label>
          <label>
            Difficulty:
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              {difficulties.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <button onClick={generateEncounter}>Generate Encounter</button>
        </div>
        
        <div className="encounter-summary-section">
          <h2>Generated Encounter</h2>
          {summary && (
            <div className="encounter-summary">
              <div><strong>Party Size:</strong> {summary.partySize}</div>
              <div><strong>Party Level:</strong> {summary.partyLevel}</div>
              <div><strong>Party Total XP:</strong> {summary.partyTotalXP.toLocaleString()}</div>
              <div><strong>Selected Difficulty:</strong> {summary.difficulty.charAt(0).toUpperCase() + summary.difficulty.slice(1)}</div>
              <div><strong>Target XP:</strong> {summary.targetXP.toLocaleString()}</div>
              <div><strong>Total XP:</strong> {summary.totalXP.toLocaleString()}</div>
              <div><strong>Adjusted XP (with multiplier):</strong> {summary.adjXP.toLocaleString()}</div>
              <div><strong>Actual Difficulty:</strong> {summary.actualDifficulty.charAt(0).toUpperCase() + summary.actualDifficulty.slice(1)}</div>
              <div><strong>Monster Count:</strong> {summary.monsterCount}</div>
            </div>
          )}
        </div>
        
        <StatblockModal monster={showStatblock} onClose={() => setShowStatblock(null)} />
      </div>
      
      <aside className="creatures-sidebar">
        <h3>Encounter Creatures</h3>
        {(!encounter || encounter.length === 0) && (
          <p style={{ color: '#b0b0b0', textAlign: 'center', marginTop: '2rem' }}>
            No encounter generated yet.
          </p>
        )}
        {encounter && encounter.length > 0 && (
          <div className="monster-blocks">
            {encounter.map((m, i) => (
              <div key={i} className="monster-row">
                <span className="monster-name">
                  {m.name}
                  {Array.isArray(m.monster.legendary_actions) && m.monster.legendary_actions.length > 0 && (
                    <span className="legendary-star">⭐</span>
                  )}
                  {m.isHorde && (
                    <span className="horde-indicator">👥</span>
                  )}
                </span>
                <span className="monster-qty">
                  {m.isHorde ? `(${m.originalQuantity} creatures)` : `×${m.quantity}`}
                </span>
                <button className="statblock-btn" onClick={() => setShowStatblock(m)}>Statblock</button>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

export default App;


