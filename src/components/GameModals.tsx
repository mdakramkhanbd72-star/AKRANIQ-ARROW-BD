import React, { useEffect } from 'react';
import { Star, Play, RotateCcw, Home, HeartCrack, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../services/soundManager';
import { adService } from '../services/adService';

interface LevelCompleteModalProps {
  isOpen: boolean;
  level: number;
  stars: number;
  score: number;
  moves: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  isOpen,
  level,
  stars,
  score,
  moves,
  onNextLevel,
  onReplay,
  onMenu,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playLevelSuccess();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col items-center text-center space-y-4">
        <h2 className="text-xl font-black tracking-wide text-[#4A7C59] dark:text-[#829079] uppercase">
          Level Complete!
        </h2>
        <div className="text-xs font-semibold text-stone-500">
          Level {level} Cleared
        </div>

        {/* Animated Stars */}
        <div className="flex items-center gap-3 py-2">
          {[1, 2, 3].map((s) => {
            const isEarned = s <= stars;
            return (
              <Star
                key={s}
                className={`w-10 h-10 transition-all duration-500 transform ${
                  isEarned
                    ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-md animate-bounce'
                    : 'text-stone-300 dark:text-stone-700 scale-90'
                }`}
                style={{ animationDelay: `${s * 150}ms` }}
              />
            );
          })}
        </div>

        {/* Stats card */}
        <div className="w-full flex items-center justify-center p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
          <div className="flex flex-col items-center">
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Moves Taken
            </div>
            <div className="text-xl font-black text-stone-900 dark:text-stone-100">
              {moves}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-2 pt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              adService.onLevelCompleted(onNextLevel);
            }}
            className="w-full h-13 flex items-center justify-center gap-2 rounded-2xl bg-[#4A7C59] hover:bg-[#3C4636] text-white font-bold text-base shadow-lg transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            NEXT LEVEL
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onReplay();
              }}
              className="h-11 flex items-center justify-center gap-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              REPLAY
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onMenu();
              }}
              className="h-11 flex items-center justify-center gap-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs transition-all"
            >
              <Home className="w-4 h-4" />
              MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  isOpen: boolean;
  onRestoreLives: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onRestoreLives,
  onRestart,
  onMenu,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-1">
          <HeartCrack className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black tracking-wide text-red-500 uppercase">
          Out of Lives
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          You have run out of hearts on this puzzle. Restore full lives (+3) to continue solving!
        </p>

        <div className="w-full space-y-2 pt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onRestoreLives();
            }}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-[#4A7C59] hover:bg-[#3C4636] text-white font-bold text-sm shadow-md transition-all"
          >
            RESTORE LIVES (+3)
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onRestart();
              }}
              className="h-11 flex items-center justify-center gap-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              RETRY
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onMenu();
              }}
              className="h-11 flex items-center justify-center gap-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs transition-all"
            >
              <Home className="w-4 h-4" />
              MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DeadlockModalProps {
  isOpen: boolean;
  onRestart: () => void;
  onMenu: () => void;
  onUnblockWithReward?: () => void;
}

export const DeadlockModal: React.FC<DeadlockModalProps> = ({
  isOpen,
  onRestart,
  onMenu,
  onUnblockWithReward,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-1">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black tracking-wide text-amber-600 dark:text-amber-500 uppercase">
          No Moves Remaining
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          All remaining arrows are blocked by each other. You can watch an ad to auto-unblock the board or restart!
        </p>

        <div className="w-full space-y-2 pt-2">
          {onUnblockWithReward && (
            <button
              onClick={() => {
                soundManager.playClick();
                adService.showRewarded('Unblock Puzzle Arrows', () => {
                  onUnblockWithReward();
                });
              }}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-100 fill-amber-100" />
              <span>WATCH AD TO UNBLOCK (REWARD)</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-2xl bg-[#4A7C59] hover:bg-[#3C4636] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            RESTART PUZZLE
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onMenu();
            }}
            className="w-full h-10 flex items-center justify-center gap-1.5 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            RETURN TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};

