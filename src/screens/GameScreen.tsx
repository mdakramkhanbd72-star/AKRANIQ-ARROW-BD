import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Palette,
  Flame,
  Sparkles,
} from 'lucide-react';
import {
  ArrowModel,
  LevelModel,
  SlidingArrowAnimation,
} from '../types/game';
import {
  calculateScore,
  levelTypeFor,
} from '../core/constants';
import { getThemeById } from '../core/themes';
import { generateLevel } from '../services/levelGenerator';
import { preferences, PreferencesState } from '../services/preferences';
import { soundManager } from '../services/soundManager';
import { adService } from '../services/adService';
import { ArrowBoardView } from '../components/ArrowBoardView';
import { MazeBackground } from '../components/MazeBackground';
import {
  LevelCompleteModal,
  DeadlockModal,
} from '../components/GameModals';
import { InGameDisplaySettingsDialog } from '../components/InGameDisplaySettingsDialog';

interface GameScreenProps {
  levelNumber: number;
  prefs: PreferencesState;
  onBackToMenu: () => void;
  onNextLevelNumber: (nextLvl: number) => void;
  isDark?: boolean;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  levelNumber,
  prefs,
  onBackToMenu,
  onNextLevelNumber,
  isDark = false,
}) => {
  const [level, setLevel] = useState<LevelModel | null>(null);
  const [arrows, setArrows] = useState<ArrowModel[]>([]);
  const [slidingArrows, setSlidingArrows] = useState<Record<string, SlidingArrowAnimation>>({});
  const [shakingArrows, setShakingArrows] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isDeadlocked, setIsDeadlocked] = useState<boolean>(false);
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [earnedScore, setEarnedScore] = useState<number>(0);
  const [showPaletteModal, setShowPaletteModal] = useState<boolean>(false);

  const activeTheme = getThemeById(prefs.gameBoardTheme);

  // Load Level
  useEffect(() => {
    const lvl = generateLevel(levelNumber);
    setLevel(lvl);
    setArrows(lvl.arrows.map((a) => ({ ...a, state: 'IDLE' })));
    setSlidingArrows({});
    setShakingArrows(new Set());
    setMoves(0);
    setIsComplete(false);
    setIsDeadlocked(false);
  }, [levelNumber]);

  const DIR_MAP = {
    UP: { dr: -1, dc: 0 },
    DOWN: { dr: 1, dc: 0 },
    LEFT: { dr: 0, dc: -1 },
    RIGHT: { dr: 0, dc: 1 },
  };

  // Compute unblocked exit trajectory
  const computeExit = (
    arrow: ArrowModel,
    allArrows: ArrowModel[],
    gridSize: number,
    ignoreId?: string
  ): { blocked: boolean; waypoints: [number, number][] } => {
    const head = arrow.path[0];
    const { dr, dc } = DIR_MAP[arrow.direction];

    // 1. Straight path check
    let r = head[0] + dr;
    let c = head[1] + dc;
    const straightWaypoints: [number, number][] = [[head[0], head[1]]];
    let straightBlocked = false;

    while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
      straightWaypoints.push([r, c]);
      const hit = allArrows.some((other) => {
        if (other.id === arrow.id) return false;
        if (ignoreId && other.id === ignoreId) return false;
        if (other.state === 'SLIDING') return false;
        return other.path.some((pt) => pt[0] === r && pt[1] === c);
      });

      if (hit) {
        straightBlocked = true;
        break;
      }
      r += dr;
      c += dc;
    }

    if (!straightBlocked) {
      // Clean escape out of bounds
      straightWaypoints.push([r, c]);
      straightWaypoints.push([r + dr * 3, c + dc * 3]);
      return { blocked: false, waypoints: straightWaypoints };
    }

    // 2. Safe corridor BFS fallback
    const corridor = findCorridorExit(head, dr, dc, allArrows, arrow.id, ignoreId, gridSize);
    if (corridor && corridor.length > 0) {
      return { blocked: false, waypoints: corridor };
    }

    return { blocked: true, waypoints: [] };
  };

  const findCorridorExit = (
    head: [number, number],
    dr: number,
    dc: number,
    allArrows: ArrowModel[],
    arrowId: string,
    ignoreId: string | undefined,
    gridSize: number
  ): [number, number][] | null => {
    const startR = head[0] + dr;
    const startC = head[1] + dc;

    if (startR < 0 || startR >= gridSize || startC < 0 || startC >= gridSize) {
      return [
        [head[0], head[1]],
        [startR, startC],
        [startR + dr * 3, startC + dc * 3],
      ];
    }

    const firstOccupied = allArrows.some((other) => {
      if (other.id === arrowId) return false;
      if (ignoreId && other.id === ignoreId) return false;
      if (other.state === 'SLIDING') return false;
      return other.path.some((pt) => pt[0] === startR && pt[1] === startC);
    });

    if (firstOccupied) return null;

    const queue: Array<{ curr: [number, number]; path: [number, number][] }> = [];
    const visited = new Set<string>();

    const initialPath: [number, number][] = [
      [head[0], head[1]],
      [startR, startC],
    ];
    queue.push({ curr: [startR, startC], path: initialPath });
    visited.add(`${startR},${startC}`);

    const directions = [
      { r: dr, c: dc },
      { r: -dc, c: dr },
      { r: dc, c: -dr },
    ];

    while (queue.length > 0) {
      const { curr, path } = queue.shift()!;
      const [cr, cc] = curr;

      for (const d of directions) {
        const nr = cr + d.r;
        const nc = cc + d.c;

        if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) {
          return [
            ...path,
            [nr, nc],
            [nr + d.r * 3, nc + d.c * 3],
          ];
        }

        const key = `${nr},${nc}`;
        if (!visited.has(key)) {
          const occupied = allArrows.some((other) => {
            if (other.id === arrowId) return false;
            if (ignoreId && other.id === ignoreId) return false;
            if (other.state === 'SLIDING') return false;
            return other.path.some((pt) => pt[0] === nr && pt[1] === nc);
          });

          if (!occupied) {
            visited.add(key);
            queue.push({ curr: [nr, nc], path: [...path, [nr, nc]] });
          }
        }
      }
    }

    return null;
  };

  const handleBlocked = (arrowIds: string[]) => {
    soundManager.playBlocked();
    setShakingArrows((prev) => new Set([...prev, ...arrowIds]));

    setTimeout(() => {
      setShakingArrows((prev) => {
        const next = new Set(prev);
        arrowIds.forEach((id) => next.delete(id));
        return next;
      });
    }, 200);
  };

  const handleArrowExit = (
    exits: Array<{ arrow: ArrowModel; waypoints: [number, number][] }>
  ) => {
    soundManager.playArrowExit();

    const newSliding: Record<string, SlidingArrowAnimation> = { ...slidingArrows };
    exits.forEach(({ arrow, waypoints }) => {
      newSliding[arrow.id] = {
        arrowId: arrow.id,
        waypoints,
        progress: 0,
      };
    });

    setArrows((prev) =>
      prev.map((a) =>
        exits.some((e) => e.arrow.id === a.id) ? { ...a, state: 'SLIDING' } : a
      )
    );
    setSlidingArrows(newSliding);

    // Ultra snappy, instant slide animation (140ms for lightning-fast mobile play)
    const duration = 140;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      setSlidingArrows((prev) => {
        const updated = { ...prev };
        exits.forEach(({ arrow }) => {
          if (updated[arrow.id]) {
            updated[arrow.id] = { ...updated[arrow.id], progress };
          }
        });
        return updated;
      });

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        // Animation finished: compute remaining arrows
        const remaining = arrows.filter(
          (a) => !exits.some((e) => e.arrow.id === a.id)
        );

        setArrows(remaining);
        setSlidingArrows((sliding) => {
          const updated = { ...sliding };
          exits.forEach(({ arrow }) => delete updated[arrow.id]);
          return updated;
        });

        // Check Win Condition or Deadlock
        if (remaining.length === 0) {
          const stars = 3;
          const score = calculateScore(levelNumber, 3, moves + 1);
          setEarnedStars(stars);
          setEarnedScore(score);
          setIsComplete(true);
          preferences.recordLevelResult(levelNumber, stars, score, moves + 1);
        } else {
          if (checkDeadlock(remaining, level?.gridSize || 10)) {
            setIsDeadlocked(true);
          }
        }
      }
    };

    requestAnimationFrame(animate);
  };

  const checkDeadlock = (remaining: ArrowModel[], gridSize: number): boolean => {
    if (remaining.length === 0) return false;
    for (const a of remaining) {
      if (a.colorGroup !== null && a.colorGroup !== undefined) {
        const pair = remaining.filter((o) => o.colorGroup === a.colorGroup);
        if (pair.length === 2) {
          const e1 = computeExit(pair[0], remaining, gridSize, pair[1].id);
          const e2 = computeExit(pair[1], remaining, gridSize, pair[0].id);
          if (!e1.blocked && !e2.blocked) return false;
        }
      } else {
        const e = computeExit(a, remaining, gridSize);
        if (!e.blocked) return false;
      }
    }
    return true;
  };

  const handleArrowTapped = (arrowId: string) => {
    if (isComplete || isDeadlocked) return;
    const arrow = arrows.find((a) => a.id === arrowId);
    if (!arrow || arrow.state !== 'IDLE') return;

    setMoves((m) => m + 1);
    const gridSize = level?.gridSize || 10;

    // Color group pair check
    if (arrow.colorGroup !== null && arrow.colorGroup !== undefined) {
      const pair = arrows.filter((a) => a.colorGroup === arrow.colorGroup);
      if (pair.length === 2) {
        const exit1 = computeExit(pair[0], arrows, gridSize, pair[1].id);
        const exit2 = computeExit(pair[1], arrows, gridSize, pair[0].id);

        if (exit1.blocked || exit2.blocked) {
          handleBlocked([pair[0].id, pair[1].id]);
        } else {
          handleArrowExit([
            { arrow: pair[0], waypoints: exit1.waypoints },
            { arrow: pair[1], waypoints: exit2.waypoints },
          ]);
        }
        return;
      }
    }

    const exit = computeExit(arrow, arrows, gridSize);
    if (exit.blocked) {
      handleBlocked([arrowId]);
    } else {
      handleArrowExit([{ arrow, waypoints: exit.waypoints }]);
    }
  };

  const handleUnblockWithReward = () => {
    setIsDeadlocked(false);
    if (arrows.length === 0) return;
    const target = arrows[0];
    const gridSize = level?.gridSize || 10;
    const exit = computeExit(target, arrows, gridSize);
    const waypoints: [number, number][] =
      exit.waypoints && exit.waypoints.length > 0
        ? exit.waypoints
        : [
            [target.path[0][0], target.path[0][1]],
            [target.path[0][0], -2],
          ];
    handleArrowExit([{ arrow: target, waypoints }]);
  };

  const type = levelTypeFor(levelNumber);
  const isBoss = type === 'BOSS';
  const isGod = type === 'GOD';

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#F2EFEA] dark:bg-[#1E231C] text-stone-900 dark:text-stone-100 select-none p-3 sm:p-5">
      <MazeBackground />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-2xl mx-auto">
        <button
          onClick={() => {
            soundManager.playClick();
            onBackToMenu();
          }}
          className="p-2.5 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur shadow-sm border border-stone-200/50 dark:border-stone-700/50 text-stone-700 dark:text-stone-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Level badge */}
        <div className="flex flex-col items-center">
          <div
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isBoss
                ? 'bg-red-500/15 text-red-500'
                : isGod
                ? 'bg-purple-600/15 text-purple-600'
                : 'bg-[#4A7C59]/15 text-[#4A7C59] dark:text-[#829079]'
            }`}
          >
            {isBoss
              ? `BOSS LEVEL ${levelNumber}`
              : isGod
              ? `GOD LEVEL ${levelNumber}`
              : level?.patternName || `LEVEL ${levelNumber}`}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* AdMob Rewarded Video Hint / Solve Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              adService.showRewarded('Magic Arrow Hint', () => {
                const gridSize = level?.gridSize || 10;
                const freeArrow = arrows.find(
                  (a) => a.state === 'IDLE' && !computeExit(a, arrows, gridSize).blocked
                );
                if (freeArrow) {
                  handleArrowTapped(freeArrow.id);
                } else if (arrows.length > 0) {
                  handleUnblockWithReward();
                }
              });
            }}
            title="Watch AdMob Rewarded Ad for Hint"
            className="relative p-2 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur shadow-sm border border-amber-500/30 text-amber-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-amber-500/20" />
            <span className="absolute -top-1 -right-1 px-1 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[7px] font-black text-white leading-none shadow-xs">
              AD
            </span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur shadow-sm border border-stone-200/50 dark:border-stone-700/50 text-xs font-bold text-[#4A7C59] dark:text-[#829079]">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>{prefs.streakDays}</span>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              setShowPaletteModal(true);
            }}
            title="Display & Palette"
            className="p-2 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur shadow-sm border border-stone-200/50 dark:border-stone-700/50 transition-all hover:scale-105 cursor-pointer"
            style={{ color: activeTheme.primaryColor }}
          >
            <Palette className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              const lvl = generateLevel(levelNumber);
              setLevel(lvl);
              setArrows(lvl.arrows.map((a) => ({ ...a, state: 'IDLE' })));
              setSlidingArrows({});
              setShakingArrows(new Set());
              setMoves(0);
              setIsDeadlocked(false);
            }}
            title="Restart Level"
            className="p-2 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur shadow-sm border border-stone-200/50 dark:border-stone-700/50 text-stone-700 dark:text-stone-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-header stats */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-md mx-auto px-4 py-1 text-xs font-bold text-stone-500 dark:text-stone-400">
        <div>Moves: {moves}</div>
        <div>Remaining: {arrows.length}</div>
      </div>

      {/* Main Board View */}
      <div className="relative z-10 flex-1 w-full max-w-2xl mx-auto flex items-center justify-center p-2 min-h-0">
        {level && (
          <ArrowBoardView
            gridSize={level.gridSize}
            arrows={arrows}
            mask={level.mask}
            slidingArrows={slidingArrows}
            shakingArrows={shakingArrows}
            onArrowTapped={handleArrowTapped}
            boardOpacity={prefs.gameBoardOpacity}
            theme={activeTheme}
            isDark={isDark}
          />
        )}
      </div>

      {/* Modals */}
      <LevelCompleteModal
        isOpen={isComplete}
        level={levelNumber}
        stars={earnedStars}
        score={earnedScore}
        moves={moves}
        onNextLevel={() => onNextLevelNumber(levelNumber + 1)}
        onReplay={() => {
          const lvl = generateLevel(levelNumber);
          setLevel(lvl);
          setArrows(lvl.arrows.map((a) => ({ ...a, state: 'IDLE' })));
          setSlidingArrows({});
          setShakingArrows(new Set());
          setMoves(0);
          setIsComplete(false);
        }}
        onMenu={onBackToMenu}
      />

      <DeadlockModal
        isOpen={isDeadlocked}
        onUnblockWithReward={handleUnblockWithReward}
        onRestart={() => {
          const lvl = generateLevel(levelNumber);
          setLevel(lvl);
          setArrows(lvl.arrows.map((a) => ({ ...a, state: 'IDLE' })));
          setSlidingArrows({});
          setShakingArrows(new Set());
          setMoves(0);
          setIsDeadlocked(false);
        }}
        onMenu={onBackToMenu}
      />

      <InGameDisplaySettingsDialog
        isOpen={showPaletteModal}
        currentOpacity={prefs.gameBoardOpacity}
        currentThemeId={prefs.gameBoardTheme}
        onOpacityChange={(op) => preferences.setGameBoardOpacity(op)}
        onThemeSelected={(th) => preferences.setGameBoardTheme(th)}
        onClose={() => setShowPaletteModal(false)}
      />
    </div>
  );
};

