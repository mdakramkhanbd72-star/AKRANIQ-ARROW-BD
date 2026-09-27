import React, { useState, useMemo } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import {
  TOTAL_LEVELS,
  TUTORIAL_LEVELS,
  isBossLevel,
  isGodLevel,
  levelTypeFor,
} from '../core/constants';
import { PreferencesState, preferences } from '../services/preferences';
import { MazeBackground } from '../components/MazeBackground';
import { soundManager } from '../services/soundManager';

interface LevelSelectScreenProps {
  prefs: PreferencesState;
  onSelectLevel: (lvl: number) => void;
  onBack: () => void;
}

type FilterType = 'ALL' | 'TUTORIAL' | 'BOSS' | 'GOD';

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  prefs: _prefs,
  onSelectLevel,
  onBack,
}) => {
  const [filter, setFilter] = useState<FilterType>('ALL');

  const levels = useMemo(() => {
    return Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).filter((lvl) => {
      if (filter === 'TUTORIAL') return lvl <= TUTORIAL_LEVELS;
      if (filter === 'BOSS') return isBossLevel(lvl);
      if (filter === 'GOD') return isGodLevel(lvl);
      return true;
    });
  }, [filter]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#F2EFEA] dark:bg-[#1E231C] text-stone-900 dark:text-stone-100 select-none p-4 sm:p-6">
      <MazeBackground />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-3xl mx-auto mb-4">
        <button
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          className="p-2.5 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur shadow-sm border border-stone-200/50 dark:border-stone-700/50 text-stone-700 dark:text-stone-300 hover:scale-105 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-xl font-black tracking-wider text-stone-900 dark:text-stone-100 uppercase">
          Level Select
        </h1>

        <div className="w-10" />
      </div>

      {/* Filter Tabs */}
      <div className="relative z-10 flex items-center justify-center gap-2 max-w-md mx-auto w-full mb-4">
        {(['ALL', 'TUTORIAL', 'BOSS', 'GOD'] as FilterType[]).map((f) => {
          const isSelected = filter === f;
          return (
            <button
              key={f}
              onClick={() => {
                soundManager.playClick();
                setFilter(f);
              }}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[#4A7C59] text-white shadow-md'
                  : 'bg-white/70 dark:bg-stone-800/70 border border-stone-200/60 dark:border-stone-700/60 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Grid of Levels - ALL UNLOCKED, NO LOCKS */}
      <div className="relative z-10 flex-1 overflow-y-auto max-w-3xl mx-auto w-full pr-1">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 pb-6">
          {levels.map((lvl) => {
            const stars = preferences.getStarsForLevel(lvl);
            const type = levelTypeFor(lvl);
            const isBoss = type === 'BOSS';
            const isGod = type === 'GOD';

            return (
              <button
                key={lvl}
                onClick={() => {
                  soundManager.playClick();
                  onSelectLevel(lvl);
                }}
                className={`aspect-square rounded-2xl p-2 flex flex-col items-center justify-between border-2 transition-all transform hover:scale-105 active:scale-95 bg-white dark:bg-stone-800/90 shadow-sm ${
                  isBoss
                    ? 'border-red-400/80 bg-red-50/30 dark:bg-red-950/20'
                    : isGod
                    ? 'border-purple-400/80 bg-purple-50/30 dark:bg-purple-950/20'
                    : 'border-stone-200/70 dark:border-stone-700/70'
                }`}
              >
                <div className="w-full flex justify-center">
                  {(isBoss || isGod) ? (
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        isBoss
                          ? 'bg-red-500/15 text-red-500'
                          : 'bg-purple-500/15 text-purple-500'
                      }`}
                    >
                      {isBoss ? 'BOSS' : 'GOD'}
                    </span>
                  ) : (
                    <div className="h-3" />
                  )}
                </div>

                <span className="text-lg font-black text-stone-800 dark:text-stone-100">
                  {lvl}
                </span>

                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-2.5 h-2.5 ${
                        s <= stars
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-200 dark:text-stone-700'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
