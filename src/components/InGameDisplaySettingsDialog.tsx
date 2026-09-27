import React from 'react';
import { Palette, X } from 'lucide-react';
import { GAME_THEMES } from '../core/themes';
import { soundManager } from '../services/soundManager';

interface InGameDisplaySettingsDialogProps {
  isOpen: boolean;
  currentOpacity: number;
  currentThemeId: string;
  onOpacityChange: (newOpacity: number) => void;
  onThemeSelected: (themeId: string) => void;
  onClose: () => void;
}

export const InGameDisplaySettingsDialog: React.FC<InGameDisplaySettingsDialogProps> = ({
  isOpen,
  currentOpacity,
  currentThemeId,
  onOpacityChange,
  onThemeSelected,
  onClose,
}) => {
  if (!isOpen) return null;

  const presets = [
    { v: 0.25, label: '25%' },
    { v: 0.5, label: '50%' },
    { v: 0.75, label: '75%' },
    { v: 1.0, label: '100%' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#4A7C59]" />
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Board Display & Themes
            </h3>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-px bg-stone-100 dark:bg-stone-800" />

        {/* Section 1: Opacity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
            <span>Board Grid Opacity</span>
            <span className="text-sm font-black text-[#4A7C59]">
              {Math.round(currentOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={currentOpacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="w-full accent-[#4A7C59] cursor-pointer"
          />
          {/* Quick presets */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {presets.map(({ v, label }) => {
              const isSelected = Math.abs(currentOpacity - v) < 0.05;
              return (
                <button
                  key={label}
                  onClick={() => onOpacityChange(v)}
                  className={`py-1 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-[#4A7C59] text-white border-[#4A7C59]'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-stone-100 dark:bg-stone-800" />

        {/* Section 2: Color Theme Palettes */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            Palette Theme
          </div>
          <div className="grid grid-cols-2 gap-2">
            {GAME_THEMES.map((thm) => {
              const isSelected = thm.id.toLowerCase() === currentThemeId.toLowerCase();
              return (
                <button
                  key={thm.id}
                  onClick={() => {
                    soundManager.playClick();
                    onThemeSelected(thm.id);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#4A7C59] bg-[#4A7C59]/10 shadow-xs'
                      : 'border-stone-200 dark:border-stone-700/60 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: thm.primaryColor }}
                  />
                  <span className="text-xs font-semibold truncate text-stone-800 dark:text-stone-200">
                    {thm.displayName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-[11px] text-stone-400 dark:text-stone-500 leading-tight">
          Adjust the grid contrast and arrow beam styling to suit your eyesight and aesthetic preference.
        </p>

        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full h-11 rounded-2xl bg-[#4A7C59] hover:bg-[#3C4636] text-white font-bold text-sm shadow-md transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
