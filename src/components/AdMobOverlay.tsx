import React, { useEffect, useState } from 'react';
import { adService, ActiveAdState } from '../services/adService';
import { X, Volume2, VolumeX, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { soundManager } from '../services/soundManager';

export const AdMobOverlay: React.FC = () => {
  const [adState, setAdState] = useState<ActiveAdState | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [canClose, setCanClose] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [rewardGranted, setRewardGranted] = useState<boolean>(false);

  useEffect(() => {
    return adService.subscribe((state) => {
      setAdState(state);
      if (state?.isOpen) {
        const initialSeconds = state.type === 'REWARDED' ? 6 : 4;
        setCountdown(initialSeconds);
        setCanClose(false);
        setRewardGranted(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!adState?.isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          if (adState.type === 'REWARDED') {
            setRewardGranted(true);
            soundManager.playLevelSuccess();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [adState]);

  if (!adState?.isOpen) return null;

  const isRewarded = adState.type === 'REWARDED';

  const handleClose = () => {
    soundManager.playClick();
    adService.handleAdFinished(isRewarded ? rewardGranted || canClose : true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/95 text-white select-none animate-fade-in backdrop-blur-md">
      {/* Top AdMob Header Bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          {/* Official Google Ads Badge */}
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/20 text-white/90 border border-white/20">
            Ad · Google AdMob
          </span>

          <button
            onClick={() => setIsMuted((m) => !m)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/80"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right side: Countdown & Close Button */}
        <div className="flex items-center gap-2">
          {!canClose ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/20 text-xs font-semibold text-white/80">
              {isRewarded ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>Reward in {countdown}s</span>
                </>
              ) : (
                <span>Skip in {countdown}s</span>
              )}
            </div>
          ) : (
            <button
              onClick={handleClose}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-stone-200 text-stone-900 font-bold text-xs shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>{isRewarded ? 'Claim Reward' : 'Close Ad'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Ad Visual Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full">
        {/* Ad Video / Creative Card */}
        <div className="relative w-full aspect-video rounded-3xl bg-gradient-to-tr from-stone-900 via-stone-800 to-stone-900 border border-white/15 p-6 shadow-2xl flex flex-col items-center justify-between overflow-hidden group">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#4A7C59]/30 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl" />

          {/* Ad Badge Top-Left inside card */}
          <div className="relative z-10 w-full flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4A7C59]" />
              Verified Ad Unit
            </span>
            <span className="text-[9px] font-mono text-stone-500 truncate max-w-[170px]">
              {adState.adUnitId}
            </span>
          </div>

          {/* Center Brand / Promotion Content */}
          <div className="relative z-10 flex flex-col items-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4A7C59] to-[#3C4636] flex items-center justify-center shadow-xl mb-3">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h3 className="text-lg font-black tracking-wide text-white">
              {adState.rewardTitle || 'Akraniq Arrow Escape'}
            </h3>
            <p className="text-xs text-stone-300 mt-1 max-w-[260px] line-clamp-2">
              Enjoy 500+ procedural arrow escape levels with zero ads interruption!
            </p>
          </div>

          {/* Interactive CTA button */}
          <div className="relative z-10 w-full">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-white text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-stone-200 transition-all shadow-md"
            >
              <span>Install & Play</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Reward Status Banner */}
        {isRewarded && (
          <div className="mt-5 w-full flex items-center justify-center">
            {rewardGranted ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-bounce">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Reward Unlocked! Tap Claim Reward to receive.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-stone-800/80 border border-stone-700 text-stone-400 text-xs">
                <span>Watch full ad to earn your reward</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Ad Footer Information */}
      <div className="p-4 flex flex-col items-center justify-center text-center bg-gradient-to-t from-black/80 to-transparent text-[11px] text-stone-500">
        <div className="flex items-center gap-3">
          <span>AdMob App ID: ca-app-pub-1737752929640330~9900507873</span>
        </div>
        <div className="text-[10px] text-stone-600 mt-0.5">
          Privacy Policy · Ads Settings by Google
        </div>
      </div>
    </div>
  );
};
