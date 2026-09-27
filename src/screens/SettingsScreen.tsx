import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  Music,
  Vibrate,
  Sun,
  Moon,
  Monitor,
  UserCheck,
  Cloud,
  LogOut,
  RotateCw,
} from 'lucide-react';
import { PreferencesState, preferences } from '../services/preferences';
import { soundManager } from '../services/soundManager';
import { AuthDialog } from '../components/AuthDialog';
import { MazeBackground } from '../components/MazeBackground';
import { APP_NAME } from '../core/constants';

interface SettingsScreenProps {
  prefs: PreferencesState;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  prefs,
  onBack,
}) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleToggleSound = () => {
    soundManager.playClick();
    const next = !prefs.soundEnabled;
    preferences.setSoundEnabled(next);
    soundManager.updateSettings(next, prefs.musicEnabled, prefs.vibrationEnabled);
  };

  const handleToggleMusic = () => {
    soundManager.playClick();
    const next = !prefs.musicEnabled;
    preferences.setMusicEnabled(next);
    soundManager.updateSettings(prefs.soundEnabled, next, prefs.vibrationEnabled);
  };

  const handleToggleVibration = () => {
    soundManager.playClick();
    const next = !prefs.vibrationEnabled;
    preferences.setVibrationEnabled(next);
    soundManager.updateSettings(prefs.soundEnabled, prefs.musicEnabled, next);
  };

  const handleSync = () => {
    soundManager.playClick();
    preferences.syncCloudProgress();
    setSyncFeedback('Synced just now!');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#F2EFEA] dark:bg-[#1E231C] text-stone-900 dark:text-stone-100 select-none p-4 sm:p-6">
      <MazeBackground />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-xl mx-auto mb-4">
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
          Settings
        </h1>

        <div className="w-10" />
      </div>

      {/* Settings Scrollable Content */}
      <div className="relative z-10 flex-1 overflow-y-auto max-w-xl mx-auto w-full space-y-4 pr-1 pb-6">
        {/* Account & Cloud Save Card */}
        <div className="p-5 rounded-3xl bg-white/90 dark:bg-stone-800/90 backdrop-blur shadow-sm border border-stone-200/70 dark:border-stone-700/70 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black tracking-wider text-[#4A7C59] dark:text-[#829079] uppercase">
              Account & Cloud Save
            </h2>
            {prefs.isLoggedIn && prefs.currentUser && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4A7C59]/15 text-[#4A7C59] dark:text-[#829079] uppercase">
                {prefs.currentUser.provider}
              </span>
            )}
          </div>

          {!prefs.isLoggedIn ? (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Save your level progress and stars securely to the cloud with Google, Facebook, Email, or Mobile OTP.
              </p>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowAuthDialog(true);
                }}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-[#4A7C59] hover:bg-[#3C4636] text-white font-bold text-sm shadow-md transition-all"
              >
                LOGIN / SIGN UP
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#4A7C59] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {prefs.currentUser?.displayName.charAt(0).toUpperCase() || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                    {prefs.currentUser?.displayName}
                  </div>
                  <div className="text-xs text-stone-400 truncate">
                    {prefs.currentUser?.identifier}
                  </div>
                </div>
              </div>

              <div className="h-px bg-stone-100 dark:bg-stone-700/60" />

              {/* Progress & Sync Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-5 h-5 text-[#4A7C59]" />
                  <div>
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      Game Progress Saved
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {syncFeedback ||
                        `Current: Level ${prefs.currentLevel}`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSync}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Sync
                </button>
              </div>

              <div className="h-px bg-stone-100 dark:bg-stone-700/60" />

              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowLogoutConfirm(true);
                }}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-2xl border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-all"
              >
                <LogOut className="w-4 h-4" />
                LOG OUT
              </button>
            </div>
          )}
        </div>

        {/* Audio & Haptics Card */}
        <div className="p-5 rounded-3xl bg-white/90 dark:bg-stone-800/90 backdrop-blur shadow-sm border border-stone-200/70 dark:border-stone-700/70 space-y-4">
          <h2 className="text-xs font-black tracking-wider text-[#4A7C59] dark:text-[#829079] uppercase">
            Audio & Haptics
          </h2>

          <div className="space-y-3">
            {/* Sound FX */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-[#4A7C59]" />
                <div>
                  <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    Sound Effects
                  </div>
                  <div className="text-xs text-stone-400">
                    Tactile clicks and swoosh sounds
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.soundEnabled}
                onChange={handleToggleSound}
                className="w-5 h-5 accent-[#4A7C59] cursor-pointer"
              />
            </div>

            <div className="h-px bg-stone-100 dark:bg-stone-700/60" />

            {/* Ambient Music */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-[#4A7C59]" />
                <div>
                  <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    Ambient Music
                  </div>
                  <div className="text-xs text-stone-400">
                    Calming background synthesizer melody
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.musicEnabled}
                onChange={handleToggleMusic}
                className="w-5 h-5 accent-[#4A7C59] cursor-pointer"
              />
            </div>

            <div className="h-px bg-stone-100 dark:bg-stone-700/60" />

            {/* Vibration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vibrate className="w-5 h-5 text-[#4A7C59]" />
                <div>
                  <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    Haptic Vibration
                  </div>
                  <div className="text-xs text-stone-400">
                    Tactile bump on move and block
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.vibrationEnabled}
                onChange={handleToggleVibration}
                className="w-5 h-5 accent-[#4A7C59] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Appearance Card */}
        <div className="p-5 rounded-3xl bg-white/90 dark:bg-stone-800/90 backdrop-blur shadow-sm border border-stone-200/70 dark:border-stone-700/70 space-y-4">
          <h2 className="text-xs font-black tracking-wider text-[#4A7C59] dark:text-[#829079] uppercase">
            Appearance
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'System', val: null, icon: Monitor },
              { label: 'Light', val: false, icon: Sun },
              { label: 'Dark', val: true, icon: Moon },
            ].map(({ label, val, icon: IconComp }) => {
              const isSelected = prefs.darkTheme === val;
              return (
                <button
                  key={label}
                  onClick={() => {
                    soundManager.playClick();
                    preferences.setDarkTheme(val);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-[#4A7C59] border-[#4A7C59] text-white shadow-sm'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/50 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                  <span className="text-xs font-bold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* About Card */}
        <div className="p-5 rounded-3xl bg-white/90 dark:bg-stone-800/90 backdrop-blur shadow-sm border border-stone-200/70 dark:border-stone-700/70 space-y-2">
          <h2 className="text-xs font-black tracking-wider text-[#4A7C59] dark:text-[#829079] uppercase">
            About
          </h2>
          <div className="text-sm font-bold text-stone-800 dark:text-stone-200">
            {APP_NAME} v1.0.0
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Procedural grid escape puzzle game featuring 500 verified solvable levels, directional laser corridors, and smooth arrow clearing mechanics.
          </p>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccessLogin={(acc) => {
          preferences.login(acc);
          setShowAuthDialog(false);
        }}
      />

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col space-y-4">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Log Out?
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Are you sure you want to log out? Your local game progress and unlocked levels on this device will remain saved.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  preferences.logout();
                  setShowLogoutConfirm(false);
                }}
                className="flex-1 h-11 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-all"
              >
                Log Out
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowLogoutConfirm(false);
                }}
                className="flex-1 h-11 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
