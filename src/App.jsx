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

// Official CR to XP mapping
const crToXp = {
  '0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800, '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900, '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000, '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000, '21': 33000, '22': 41000, '23': 50000, '24': 62000, '25': 75000, '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000
};

// Encounter multipliers (DMG)
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
function calculateDifficulty(partyLevel, partySize, monsterXP) {
  const partyTotalXP = characterXPByLevel[partyLevel] * partySize;
  const ratio = monsterXP / partyTotalXP;
  
  // Define difficulty thresholds based on ratio
  if (ratio < 0.3) return 'easy';
  if (ratio < 0.6) return 'medium';
  if (ratio < 1.0) return 'hard';
  return 'deadly';
}

// Get difficulty range for a given party
function getDifficultyRange(partyLevel, partySize) {
  const partyTotalXP = characterXPByLevel[partyLevel] * partySize;
  
  return {
    easy: Math.round(partyTotalXP * 0.3),
    medium: Math.round(partyTotalXP * 0.6),
    hard: Math.round(partyTotalXP * 1.0),
    deadly: Math.round(partyTotalXP * 1.5)
  };
}

function getMultiplier(count) {
  for (let i = encounterMultipliers.length - 1; i >= 0; i--) {
    if (count >= encounterMultipliers[i].count) return encounterMultipliers[i].mult;
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
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{m.name}</h2>
        <div><strong>Type:</strong> {m.type}</div>
        <div><strong>CR:</strong> {m.cr}</div>
        <div><strong>HP:</strong> {m.hit_points} ({m.hit_dice})</div>
        <div><strong>AC:</strong> {formatAC(m.armor_class)}</div>
        <div><strong>Speed:</strong> {formatSpeed(m.speed)}</div>
        <div><strong>STR/DEX/CON/INT/WIS/CHA:</strong> {m.strength} / {m.dexterity} / {m.constitution} / {m.intelligence} / {m.wisdom} / {m.charisma}</div>
        <div><strong>Saving Throws:</strong> 
          STR {formatSave(m.strength_save, m.strength)}, 
          DEX {formatSave(m.dexterity_save, m.dexterity)}, 
          CON {formatSave(m.constitution_save, m.constitution)}, 
          INT {formatSave(m.intelligence_save, m.intelligence)}, 
          WIS {formatSave(m.wisdom_save, m.wisdom)}, 
          CHA {formatSave(m.charisma_save, m.charisma)}
        </div>
        {m.senses && <div><strong>Senses:</strong> {m.senses}</div>}
        {m.languages && <div><strong>Languages:</strong> {m.languages}</div>}
        {m.proficiencies && m.proficiencies.length > 0 && (
          <div><strong>Proficiencies:</strong> {m.proficiencies.map(p => p.proficiency.name).join(', ')}</div>
        )}
        {m.special_abilities && m.special_abilities.length > 0 && (
          <div>
            <strong>Special Abilities:</strong>
            <ul>{m.special_abilities.map((a, i) => <li key={i}><strong>{a.name}:</strong> {a.desc}</li>)}</ul>
          </div>
        )}
        {m.actions && m.actions.length > 0 && (
          <div>
            <strong>Actions:</strong>
            <ul>{m.actions.map((a, i) => <li key={i}><strong>{a.name}:</strong> {a.desc}</li>)}</ul>
          </div>
        )}
        {m.legendary_actions && m.legendary_actions.length > 0 && (
          <div>
            <strong>Legendary Actions:</strong>
            <ul>{m.legendary_actions.map((a, i) => <li key={i}><strong>{a.name}:</strong> {a.desc}</li>)}</ul>
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
  const total = monsters.reduce((sum, m) => sum + getMonsterXP(m.monster.cr) * m.quantity, 0);
  const count = monsters.reduce((sum, m) => sum + m.quantity, 0);
  const mult = getMultiplier(count);
  return Math.round(total * mult);
}

function App() {
  const [monsters, setMonsters] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [partySize, setPartySize] = useState(4);
  const [partyLevel, setPartyLevel] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
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
    const pool = monsters.filter(m => m.type === selectedType);
    if (pool.length === 0) {
      setEncounter([]);
      setSummary(null);
      return;
    }
    
    const difficultyRange = getDifficultyRange(partyLevel, partySize);
    const targetXP = difficultyRange[difficulty];

    // Determine monster count with 90% chance for 1-2 monsters, 10% for 3+
    let maxMonsters;
    if (Math.random() < 0.9) {
      maxMonsters = 2;
    } else {
      maxMonsters = partyLevel >= 8 ? 8 : 5;
    }

    // Legendary monster rules
    const isLegendary = m => Array.isArray(m.legendary_actions) && m.legendary_actions.length > 0;
    let maxLegendaries = 0;
    if (partyLevel > 15) {
      // 20% chance for 1 legendary, 1% for 2
      if (Math.random() < 0.01) {
        maxLegendaries = 2;
      } else if (Math.random() < 0.2) {
        maxLegendaries = 1;
      }
    } else {
      // 10% chance for 1 legendary
      if (Math.random() < 0.1) {
        maxLegendaries = 1;
      }
    }

    // Try up to 1000 times to find a valid encounter
    let best = null;
    for (let tries = 0; tries < 1000; tries++) {
      let result = [];
      let count = Math.floor(Math.random() * maxMonsters) + 1;
      let used = new Set();
      for (let i = 0; i < count; i++) {
        let idx, m;
        let attempts = 0;
        do {
          idx = Math.floor(Math.random() * pool.length);
          m = pool[idx];
          attempts++;
        } while (
          (used.has(idx) && used.size < pool.length) ||
          (isLegendary(m) && attempts < 20)
        );
        used.add(idx);
        result.push({
          name: m.name,
          quantity: Math.floor(Math.random() * 8) + 1,
          monster: m
        });
      }
      // Don't allow more than maxLegendaries
      if (result.filter(x => isLegendary(x.monster)).length > maxLegendaries) continue;
      const adjXP = getAdjustedXP(result);
      if (adjXP >= targetXP * 0.9 && adjXP <= targetXP * 1.1) {
        best = result;
        break;
      }
      // Save the closest one
      if (!best || Math.abs(getAdjustedXP(best) - targetXP) > Math.abs(adjXP - targetXP)) {
        best = result;
      }
    }
    setEncounter(best);
    
    // Prepare summary with new calculation
    const totalXP = best.reduce((sum, m) => sum + getMonsterXP(m.monster.cr) * m.quantity, 0);
    const adjXP = getAdjustedXP(best);
    const partyTotalXP = characterXPByLevel[partyLevel] * partySize;
    const actualDifficulty = calculateDifficulty(partyLevel, partySize, adjXP);
    
    setSummary({
      partySize,
      partyLevel,
      partyTotalXP,
      difficulty,
      targetXP,
      totalXP,
      adjXP,
      monsterCount: best.reduce((sum, m) => sum + m.quantity, 0),
      actualDifficulty,
      difficultyRange
    });
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

  const difficultyRange = getDifficultyRange(partyLevel, partySize);
  const partyTotalXP = characterXPByLevel[partyLevel] * partySize;

  return (
    <div className="app-main-layout">
      <aside className="legend-sidebar">
        <h3>Legend</h3>
        <ul className="legend-list">
          {legend.map((item, i) => (
            <li key={i} className="legend-item">
              <strong>{item.label}:</strong> <span>{item.desc}</span>
            </li>
          ))}
        </ul>
        
        <div className="difficulty-ranges block-card">
          <h4>Difficulty Ranges for Party</h4>
          <div><strong>Party Total XP:</strong> {partyTotalXP.toLocaleString()}</div>
          <div><strong>Easy:</strong> 0 - {difficultyRange.easy.toLocaleString()} XP</div>
          <div><strong>Medium:</strong> {difficultyRange.easy.toLocaleString()} - {difficultyRange.medium.toLocaleString()} XP</div>
          <div><strong>Hard:</strong> {difficultyRange.medium.toLocaleString()} - {difficultyRange.hard.toLocaleString()} XP</div>
          <div><strong>Deadly:</strong> {difficultyRange.hard.toLocaleString()} - {difficultyRange.deadly.toLocaleString()} XP</div>
        </div>
      </aside>
      <div className="app-container">
        <h1>D&D 5e Encounter Generator</h1>
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
        <div className="encounter-list">
          <h2>Generated Encounter</h2>
          {summary && (
            <div className="encounter-summary block-card">
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
          {encounter.length === 0 && <p>No encounter generated yet.</p>}
          <div className="monster-blocks">
            {encounter.map((m, i) => (
              <div key={i} className="monster-row block-card">
                <span className="monster-name">{m.name}</span>
                <span className="monster-qty">×{m.quantity}</span>
                <button className="statblock-btn" onClick={() => setShowStatblock(m)}>Statblock</button>
              </div>
            ))}
          </div>
        </div>
        <StatblockModal monster={showStatblock} onClose={() => setShowStatblock(null)} />
      </div>
    </div>
  );
}

export default App;


