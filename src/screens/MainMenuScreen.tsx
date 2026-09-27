import React from 'react';
import { Play, Settings, Sparkles } from 'lucide-react';
import { levelTypeFor } from '../core/constants';
import { StreakBadge } from '../components/StreakBadge';
import { MazeBackground } from '../components/MazeBackground';
import { preferences, PreferencesState } from '../services/preferences';
import { soundManager } from '../services/soundManager';
import { adService } from '../services/adService';

interface MainMenuScreenProps {
  prefs: PreferencesState;
  onPlayLevel: (lvl: number) => void;
  onOpenSettings: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  prefs,
  onPlayLevel,
  onOpenSettings,
}) => {
  const currentLvl = prefs.currentLevel;
  const selectedType = levelTypeFor(currentLvl);
  const isBoss = selectedType === 'BOSS';
  const isGod = selectedType === 'GOD';

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#F2EFEA] dark:bg-[#1E231C] text-stone-900 dark:text-stone-100 select-none p-5 sm:p-8">
      <MazeBackground />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-xl mx-auto">
        <div className="flex items-center gap-2.5">
          <StreakBadge streakDays={prefs.streakDays} />
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenSettings();
          }}
          title="Settings"
          className="p-2.5 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur shadow-sm border border-stone-200/50 dark:border-stone-700/50 text-stone-700 dark:text-stone-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Center Hero Logo & Title */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-6">
        {/* Animated App Icon */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-3 bg-gradient-to-tr from-[#3C4636] to-[#5E6B56] rounded-3xl blur-lg opacity-40 group-hover:opacity-70 transition duration-1000" />
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-[#3C4636] to-[#5E6B56] p-5 shadow-2xl flex items-center justify-center transform transition duration-500 hover:scale-105">
            {/* Crisp SVG Logo */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-white fill-none stroke-current"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="50"
                cy="50"
                r="38"
                className="opacity-40"
                strokeDasharray="14 10"
              />
              <path
                d="M32 68 L64 36 M64 36 H40 M64 36 V60"
                strokeWidth="8"
                className="text-white filter drop-shadow"
              />
              <circle cx="32" cy="68" r="4" fill="white" stroke="none" />
              <circle cx="64" cy="36" r="3" fill="#00E676" stroke="none" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-stone-900 dark:text-stone-100 uppercase">
          Akraniq Arrow
        </h1>
        <div className="mt-2 inline-flex items-center px-4 py-1 rounded-full bg-[#4A7C59]/15 dark:bg-[#4A7C59]/30 text-xs font-bold text-[#4A7C59] dark:text-[#829079]">
          Procedural Arrow Escape
        </div>

        {/* Clean Current Level Indicator */}
        <div className="mt-8 flex flex-col items-center">
          <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-1">
            Current Level
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black tracking-wide ${
              isBoss
                ? 'text-red-500'
                : isGod
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-[#4A7C59] dark:text-[#829079]'
            }`}
          >
            Level {currentLvl}
            {isBoss && ' · Boss'}
            {isGod && ' · God'}
          </div>
        </div>
      </div>

      {/* Main Single Play Action Button & Rewarded Ad Bonus */}
      <div className="relative z-10 w-full max-w-sm mx-auto pb-4 space-y-2.5">
        <button
          onClick={() => {
            soundManager.playClick();
            onPlayLevel(currentLvl);
          }}
          className={`w-full h-16 rounded-2xl font-black text-lg text-white shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            isBoss
              ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
              : isGod
              ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
              : 'bg-[#4A7C59] hover:bg-[#3C4636] shadow-[#4A7C59]/30'
          }`}
        >
          <Play className="w-6 h-6 fill-current" />
          PLAY LEVEL {currentLvl}
        </button>

        {/* Free Streak Booster (Rewarded AdMob Unit) */}
        <button
          onClick={() => {
            soundManager.playClick();
            adService.showRewarded('Daily Streak Booster (+1 Day)', () => {
              preferences.addStreakBonus();
            });
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-white/70 dark:bg-stone-800/70 hover:bg-white dark:hover:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Watch Ad for +1 Day Streak Boost</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400">
            Ad
          </span>
        </button>
      </div>
    </div>
  );
};

