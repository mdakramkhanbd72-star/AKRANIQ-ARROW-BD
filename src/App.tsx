import React, { useState, useEffect } from 'react';
import { preferences, PreferencesState } from './services/preferences';
import { soundManager } from './services/soundManager';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { GameScreen } from './screens/GameScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AdMobOverlay } from './components/AdMobOverlay';

type ScreenType = 'MAIN_MENU' | 'GAME' | 'SETTINGS';

export default function App() {
  const [prefs, setPrefs] = useState<PreferencesState>(preferences.getState());
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('MAIN_MENU');
  const [activeLevel, setActiveLevel] = useState<number>(prefs.currentLevel);

  useEffect(() => {
    const unsubscribe = preferences.subscribe(() => {
      setPrefs({ ...preferences.getState() });
    });
    return unsubscribe;
  }, []);

  // System vs User Dark Theme Sync
  const isDark =
    prefs.darkTheme !== null
      ? prefs.darkTheme
      : typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Audio settings sync
  useEffect(() => {
    soundManager.updateSettings(
      prefs.soundEnabled,
      prefs.musicEnabled,
      prefs.vibrationEnabled
    );
  }, [prefs.soundEnabled, prefs.musicEnabled, prefs.vibrationEnabled]);

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-[#F2EFEA] dark:bg-[#1E231C]">
      {/* Container framing responsive viewport */}
      <div className="w-full h-full max-w-lg md:max-w-2xl lg:max-w-3xl flex flex-col shadow-2xl overflow-hidden relative">
        {currentScreen === 'MAIN_MENU' && (
          <MainMenuScreen
            prefs={prefs}
            onPlayLevel={(lvl) => {
              setActiveLevel(lvl);
              setCurrentScreen('GAME');
            }}
            onOpenSettings={() => setCurrentScreen('SETTINGS')}
          />
        )}

        {currentScreen === 'GAME' && (
          <GameScreen
            levelNumber={activeLevel}
            prefs={prefs}
            isDark={isDark}
            onBackToMenu={() => setCurrentScreen('MAIN_MENU')}
            onNextLevelNumber={(nextLvl) => {
              if (nextLvl <= 500) {
                preferences.setCurrentLevel(nextLvl);
                setActiveLevel(nextLvl);
              } else {
                setCurrentScreen('MAIN_MENU');
              }
            }}
          />
        )}

        {currentScreen === 'SETTINGS' && (
          <SettingsScreen
            prefs={prefs}
            onBack={() => setCurrentScreen('MAIN_MENU')}
          />
        )}

        {/* Global Google AdMob Ad Overlay */}
        <AdMobOverlay />
      </div>
    </div>
  );
}

