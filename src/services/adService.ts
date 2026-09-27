// Google AdMob Configuration & Service
// Configured with official AdMob App ID and Ad Units provided by the user

export const ADMOB_CONFIG = {
  appId: 'ca-app-pub-1737752929640330~9900507873',
  publisherId: 'ca-app-pub-1737752929640330',
  interstitialAdUnitId: 'ca-app-pub-1737752929640330/6919121316',
  rewardedAdUnitId: 'ca-app-pub-1737752929640330/8719288146',
} as const;

export type AdType = 'INTERSTITIAL' | 'REWARDED';

export interface ActiveAdState {
  isOpen: boolean;
  type: AdType;
  adUnitId: string;
  rewardTitle?: string;
  onCompleted?: (rewardEarned: boolean) => void;
}

type AdListener = (state: ActiveAdState | null) => void;

class AdService {
  private static instance: AdService | null = null;
  private listeners: Set<AdListener> = new Set();
  private activeAd: ActiveAdState | null = null;
  private levelsCompletedSinceAd: number = 0;

  private constructor() {
    // Register global bridge callbacks for Android native integration
    if (typeof window !== 'undefined') {
      (window as unknown as { onAdMobReward?: () => void }).onAdMobReward = () => {
        this.handleAdFinished(true);
      };
      (window as unknown as { onAdMobDismissed?: () => void }).onAdMobDismissed = () => {
        this.handleAdFinished(false);
      };
    }
  }

  public static get(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  public subscribe(listener: AdListener): () => void {
    this.listeners.add(listener);
    listener(this.activeAd);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.activeAd));
  }

  /**
   * Shows an Interstitial Ad (ca-app-pub-1737752929640330/6919121316)
   * Used on level transition or replay
   */
  public showInterstitial(onFinished?: () => void): void {
    const adUnitId = ADMOB_CONFIG.interstitialAdUnitId;

    // 1. Try Native Android / Capacitor / Cordova AdMob SDK if present
    const win = typeof window !== 'undefined' ? (window as unknown as Record<string, any>) : {};
    if (win.AndroidAdMob?.showInterstitial) {
      try {
        win.AndroidAdMob.showInterstitial(adUnitId);
        if (onFinished) onFinished();
        return;
      } catch (err) {
        console.warn('Native AndroidAdMob call failed:', err);
      }
    }

    if (win.AdMob?.showInterstitial) {
      try {
        win.AdMob.showInterstitial({ adId: adUnitId }).then(() => {
          if (onFinished) onFinished();
        });
        return;
      } catch (err) {
        console.warn('Capacitor/Cordova AdMob call failed:', err);
      }
    }

    // 2. Try Google H5 Games / Web AdSense Ads
    if (win.adsbygoogle && typeof win.adBreak === 'function') {
      try {
        win.adBreak({
          type: 'next',
          name: 'level_transition',
          beforeAd: () => {},
          afterAd: () => {
            if (onFinished) onFinished();
          },
        });
        return;
      } catch (err) {
        console.warn('Web adBreak failed:', err);
      }
    }

    // 3. High-fidelity Web & Mobile In-App Ad Display (works seamlessly everywhere)
    this.activeAd = {
      isOpen: true,
      type: 'INTERSTITIAL',
      adUnitId,
      onCompleted: () => {
        if (onFinished) onFinished();
      },
    };
    this.notify();
  }

  /**
   * Shows a Rewarded Ad (ca-app-pub-1737752929640330/8719288146)
   * Used for unblocking arrows, hints, or bonus rewards
   */
  public showRewarded(rewardTitle: string, onRewardEarned: () => void, onDismissed?: () => void): void {
    const adUnitId = ADMOB_CONFIG.rewardedAdUnitId;

    // 1. Try Native Android / Capacitor / Cordova AdMob SDK if present
    const win = typeof window !== 'undefined' ? (window as unknown as Record<string, any>) : {};
    if (win.AndroidAdMob?.showRewarded) {
      try {
        win.AndroidAdMob.showRewarded(adUnitId);
        // android will trigger onAdMobReward callback
        return;
      } catch (err) {
        console.warn('Native AndroidAdMob call failed:', err);
      }
    }

    if (win.AdMob?.showRewardVideoAd) {
      try {
        win.AdMob.showRewardVideoAd({ adId: adUnitId }).then(() => {
          onRewardEarned();
        });
        return;
      } catch (err) {
        console.warn('Capacitor/Cordova AdMob call failed:', err);
      }
    }

    // 2. Try Google Web Rewarded Ad
    if (win.adsbygoogle && typeof win.adBreak === 'function') {
      try {
        win.adBreak({
          type: 'reward',
          name: 'user_reward',
          beforeReward: (showAdFn: () => void) => {
            showAdFn();
          },
          adDismissed: () => {
            if (onDismissed) onDismissed();
          },
          adViewed: () => {
            onRewardEarned();
          },
        });
        return;
      } catch (err) {
        console.warn('Web reward adBreak failed:', err);
      }
    }

    // 3. High-fidelity Web & Mobile In-App Ad Display
    this.activeAd = {
      isOpen: true,
      type: 'REWARDED',
      adUnitId,
      rewardTitle,
      onCompleted: (earned) => {
        if (earned) {
          onRewardEarned();
        } else {
          if (onDismissed) onDismissed();
        }
      },
    };
    this.notify();
  }

  /**
   * Called automatically upon level completion to show interstitial every 2 levels
   */
  public onLevelCompleted(callback: () => void): void {
    this.levelsCompletedSinceAd++;
    // Show interstitial every 2 levels for optimal retention and monetization
    if (this.levelsCompletedSinceAd >= 2) {
      this.levelsCompletedSinceAd = 0;
      this.showInterstitial(callback);
    } else {
      callback();
    }
  }

  public handleAdFinished(rewardEarned: boolean): void {
    if (!this.activeAd) return;
    const cb = this.activeAd.onCompleted;
    this.activeAd = null;
    this.notify();
    if (cb) cb(rewardEarned);
  }

  public getActiveAd(): ActiveAdState | null {
    return this.activeAd;
  }
}

export const adService = AdService.get();
