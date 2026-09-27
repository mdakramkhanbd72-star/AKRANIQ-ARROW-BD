import {
  ArrowDirectionType,
  ArrowModel,
  Difficulty,
  LevelModel,
  MaskShape,
} from '../types/game';
import { levelTypeFor } from '../core/constants';

// Seeded PRNG (Mulberry32) for 100% deterministic level reproduction
function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHAPES: MaskShape[] = [
  'SQUARE',
  'CIRCLE',
  'DIAMOND',
  'HEART',
  'STAR',
  'HEXAGON',
  'CROSS',
  'CHEVRON',
  'CROWN',
  'CRESCENT',
];

const DIR_OFFSETS: Record<ArrowDirectionType, { dr: number; dc: number; opposite: ArrowDirectionType }> = {
  UP: { dr: -1, dc: 0, opposite: 'DOWN' },
  DOWN: { dr: 1, dc: 0, opposite: 'UP' },
  LEFT: { dr: 0, dc: -1, opposite: 'RIGHT' },
  RIGHT: { dr: 0, dc: 1, opposite: 'LEFT' },
};

const ALL_DIRS: ArrowDirectionType[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

function generateMask(shape: MaskShape, gridSize: number): Set<string> {
  const mask = new Set<string>();
  const center = (gridSize - 1) / 2;
  const radius = center * 0.92;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const dr = (r - center) / radius;
      const dc = (c - center) / radius;
      let inShape = true;

      switch (shape) {
        case 'SQUARE':
          inShape = true;
          break;
        case 'CIRCLE':
          inShape = dr * dr + dc * dc <= 1.05;
          break;
        case 'DIAMOND':
          inShape = Math.abs(dr) + Math.abs(dc) <= 1.15;
          break;
        case 'CROSS':
          inShape = Math.abs(dr) <= 0.42 || Math.abs(dc) <= 0.42;
          break;
        case 'HEART': {
          const y = -dr;
          const x = dc;
          const a = x * x + y * y - 0.7;
          inShape = a * a * a - x * x * y * y * y <= 0.08;
          break;
        }
        case 'STAR': {
          const dist = Math.sqrt(dr * dr + dc * dc);
          const angle = Math.atan2(dr, dc);
          const starRadius = 0.55 + 0.35 * Math.cos(angle * 5);
          inShape = dist <= starRadius;
          break;
        }
        case 'HEXAGON':
          inShape =
            Math.abs(dc) <= 0.95 &&
            Math.abs(dr) * 0.866 + Math.abs(dc) * 0.5 <= 0.95;
          break;
        case 'CHEVRON':
          inShape = Math.abs(dc) <= 0.85 && dr >= Math.abs(dc) * 0.7 - 0.7;
          break;
        case 'CROWN':
          inShape =
            dr >= -0.7 &&
            (dr >= -0.2 || (c % 2 === 0 && Math.abs(dc) <= 0.85));
          break;
        case 'CRESCENT': {
          const inOuter = dr * dr + dc * dc <= 1.0;
          const inInner = (dr - 0.25) * (dr - 0.25) + (dc - 0.3) * (dc - 0.3) <= 0.7;
          inShape = inOuter && !inInner;
          break;
        }
        default:
          inShape = true;
      }

      if (inShape) {
        mask.add(`${r},${c}`);
      }
    }
  }

  // Ensure mask has enough cells
  if (mask.size < 6) {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        mask.add(`${r},${c}`);
      }
    }
  }
  return mask;
}

export function generateLevel(levelNumber: number): LevelModel {
  const prng = createPRNG(levelNumber * 19937 + 101);
  const type = levelTypeFor(levelNumber);

  // Determine grid size
  let gridSize = 6;
  if (levelNumber <= 3) {
    gridSize = levelNumber === 1 ? 5 : levelNumber === 2 ? 6 : 7;
  } else if (levelNumber <= 15) {
    gridSize = 7 + Math.floor(prng() * 2);
  } else if (levelNumber <= 40) {
    gridSize = 8 + Math.floor(prng() * 2);
  } else if (levelNumber <= 100) {
    gridSize = 9 + Math.floor(prng() * 3);
  } else if (levelNumber <= 250) {
    gridSize = 11 + Math.floor(prng() * 3);
  } else {
    gridSize = 13 + Math.floor(prng() * 3);
  }

  // Boss & God levels get slightly denser / larger boards
  if (type === 'BOSS') gridSize = Math.min(16, gridSize + 1);
  if (type === 'GOD') gridSize = Math.min(18, gridSize + 2);

  // Difficulty
  let difficulty: Difficulty = 'Easy';
  if (levelNumber <= 3) difficulty = 'Tutorial';
  else if (levelNumber <= 25) difficulty = 'Easy';
  else if (levelNumber <= 75) difficulty = 'Medium';
  else if (levelNumber <= 160) difficulty = 'Hard';
  else if (levelNumber <= 300) difficulty = 'Expert';
  else if (levelNumber <= 420) difficulty = 'Master';
  else difficulty = 'Legend';

  // Pattern name
  let patternName = `Level ${levelNumber}`;
  if (levelNumber <= 3) {
    patternName = `Tutorial ${levelNumber}`;
  } else if (type === 'BOSS') {
    patternName = `Boss ${levelNumber}`;
  } else if (type === 'GOD') {
    patternName = `God ${levelNumber}`;
  }

  // Mask shape
  const maskShape =
    levelNumber <= 5
      ? 'SQUARE'
      : SHAPES[Math.floor(prng() * SHAPES.length)];

  const mask = generateMask(maskShape, gridSize);

  // Determine target number of arrows
  let targetArrows = 4;
  if (levelNumber === 1) targetArrows = 4;
  else if (levelNumber === 2) targetArrows = 6;
  else if (levelNumber === 3) targetArrows = 8;
  else {
    const minArrows = Math.min(50, 8 + Math.floor(levelNumber * 0.12));
    const maxArrows = Math.min(75, 12 + Math.floor(levelNumber * 0.16));
    targetArrows = minArrows + Math.floor(prng() * (maxArrows - minArrows + 1));
  }

  // Occupied grid cells: map "r,c" -> arrowId
  const occupied = new Map<string, string>();
  const insertedArrows: ArrowModel[] = [];

  // Helper: check if a ray from (r, c) along direction (dr, dc) reaches grid edge without hitting occupied cells
  function isRayClear(startR: number, startC: number, dr: number, dc: number): boolean {
    let r = startR + dr;
    let c = startC + dc;
    while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
      if (occupied.has(`${r},${c}`)) return false;
      r += dr;
      c += dc;
    }
    return true;
  }

  // REVERSE PUZZLE GENERATION:
  // In reverse, we place arrows that currently have an unobstructed exit to the boundary.
  // When played in forward order (the reverse of insertion), the arrows will be cleared backwards!
  let attempts = 0;
  const maxAttempts = targetArrows * 60;
  let colorGroupCounter = 0;

  // For high levels, occasionally pair arrows with color groups
  const allowColorGroups = levelNumber >= 20 && (type === 'BOSS' || type === 'GOD' || prng() < 0.25);

  while (insertedArrows.length < targetArrows && attempts < maxAttempts) {
    attempts++;

    // Pick a candidate cell inside mask that is not currently occupied
    const candidateCells = Array.from(mask).filter((key) => !occupied.has(key));
    if (candidateCells.length === 0) break;

    const cellKey = candidateCells[Math.floor(prng() * candidateCells.length)];
    const [headR, headC] = cellKey.split(',').map(Number);

    // Pick a forward exit direction that currently has an unobstructed ray to the border
    const validDirs = ALL_DIRS.filter((dir) => {
      const { dr, dc } = DIR_OFFSETS[dir];
      return isRayClear(headR, headC, dr, dc);
    });

    if (validDirs.length === 0) continue;

    const exitDir = validDirs[Math.floor(prng() * validDirs.length)];
    const backOffset = DIR_OFFSETS[DIR_OFFSETS[exitDir].opposite];

    // Determine body length (1, 2, or 3 cells)
    const maxLen = levelNumber <= 5 ? 1 : prng() < 0.65 ? 1 : prng() < 0.85 ? 2 : 3;
    const path: [number, number][] = [[headR, headC]];
    let currentR = headR;
    let currentC = headC;
    let validPath = true;

    for (let s = 1; s < maxLen; s++) {
      const nextR = currentR + backOffset.dr;
      const nextC = currentC + backOffset.dc;
      const k = `${nextR},${nextC}`;
      if (
        nextR >= 0 &&
        nextR < gridSize &&
        nextC >= 0 &&
        nextC < gridSize &&
        mask.has(k) &&
        !occupied.has(k)
      ) {
        path.push([nextR, nextC]);
        currentR = nextR;
        currentC = nextC;
      } else {
        break;
      }
    }

    // Now insert this arrow as a clean, independent arrow
    const arrowId = `a_${levelNumber}_${insertedArrows.length}`;
    path.forEach(([r, c]) => occupied.set(`${r},${c}`, arrowId));

    insertedArrows.push({
      id: arrowId,
      row: headR,
      col: headC,
      direction: exitDir,
      state: 'IDLE',
      isPartOfPattern: true,
      mechanic: 'STANDARD',
      colorGroup: null,
      path,
    });
  }

  // Solution order is the exact REVERSE of insertion order
  const solutionOrder = insertedArrows.map((a) => a.id).reverse();

  return {
    levelNumber,
    gridSize,
    arrows: insertedArrows,
    patternName,
    difficulty,
    solutionOrder,
    maskShape,
    mask,
  };
}
