import { UserAccount } from '../types/game';
import { MAX_LIVES, TOTAL_LEVELS } from '../core/constants';

const KEY_CURRENT_LEVEL = 'akraniq_current_level';
const KEY_HIGHEST_UNLOCKED = 'akraniq_highest_unlocked';
const KEY_LIVES = 'akraniq_lives';
const KEY_TOTAL_SCORE = 'akraniq_total_score';
const KEY_STREAK_DAYS = 'akraniq_streak_days';
const KEY_LAST_PLAYED = 'akraniq_last_played';
const KEY_SOUND = 'akraniq_sound_enabled';
const KEY_MUSIC = 'akraniq_music_enabled';
const KEY_VIBRATION = 'akraniq_vibration_enabled';
const KEY_DARK_THEME = 'akraniq_dark_theme';
const KEY_BOARD_OPACITY = 'akraniq_board_opacity';
const KEY_BOARD_THEME = 'akraniq_board_theme';
const KEY_AUTH_USER = 'akraniq_auth_user';
const KEY_STARS_PREFIX = 'akraniq_stars_';
const KEY_SCORE_PREFIX = 'akraniq_score_';

export interface PreferencesState {
  currentLevel: number;
  highestUnlockedLevel: number;
  lives: number;
  totalScore: number;
  streakDays: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  darkTheme: boolean | null; // null = system
  gameBoardOpacity: number;
  gameBoardTheme: string;
  isLoggedIn: boolean;
  currentUser: UserAccount | null;
}

class PreferencesRepository {
  private static instance: PreferencesRepository | null = null;
  private listeners: Set<() => void> = new Set();

  private state: PreferencesState;

  private constructor() {
    this.state = this.loadInitial();
    this.checkDailyStreak();
  }

  public static get(): PreferencesRepository {
    if (!PreferencesRepository.instance) {
      PreferencesRepository.instance = new PreferencesRepository();
    }
    return PreferencesRepository.instance;
  }

  private loadInitial(): PreferencesState {
    const currentLevel = parseInt(localStorage.getItem(KEY_CURRENT_LEVEL) || '1', 10);
    // All levels unlocked from start for smooth fast unrestricted play
    const highestUnlocked = TOTAL_LEVELS;
    const lives = MAX_LIVES;
    const totalScore = parseInt(localStorage.getItem(KEY_TOTAL_SCORE) || '0', 10);
    const streakDays = parseInt(localStorage.getItem(KEY_STREAK_DAYS) || '1', 10);
    const soundEnabled = localStorage.getItem(KEY_SOUND) !== 'false';
    const musicEnabled = localStorage.getItem(KEY_MUSIC) !== 'false';
    const vibrationEnabled = localStorage.getItem(KEY_VIBRATION) !== 'false';

    const darkStored = localStorage.getItem(KEY_DARK_THEME);
    const darkTheme = darkStored === null ? null : darkStored === 'true';

    const boardOpacity = parseFloat(localStorage.getItem(KEY_BOARD_OPACITY) || '1.0');
    const boardTheme = localStorage.getItem(KEY_BOARD_THEME) || 'SAGE';

    const savedUserStr = localStorage.getItem(KEY_AUTH_USER);
    let currentUser: UserAccount | null = null;
    let isLoggedIn = false;
    if (savedUserStr) {
      try {
        currentUser = JSON.parse(savedUserStr);
        isLoggedIn = true;
      } catch {
        currentUser = null;
      }
    }

    return {
      currentLevel: Math.max(1, Math.min(TOTAL_LEVELS, currentLevel)),
      highestUnlockedLevel: TOTAL_LEVELS,
      lives: MAX_LIVES,
      totalScore,
      streakDays: Math.max(1, streakDays),
      soundEnabled,
      musicEnabled,
      vibrationEnabled,
      darkTheme,
      gameBoardOpacity: Math.max(0.15, Math.min(1.0, boardOpacity)),
      gameBoardTheme: boardTheme,
      isLoggedIn,
      currentUser,
    };
  }

  private notifyScheduled = false;

  private notify() {
    if (this.notifyScheduled) return;
    this.notifyScheduled = true;
    queueMicrotask(() => {
      this.notifyScheduled = false;
      this.listeners.forEach((listener) => {
        try {
          listener();
        } catch (e) {
          console.error(e);
        }
      });
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): PreferencesState {
    return this.state;
  }

  public setCurrentLevel(lvl: number) {
    const clamped = Math.max(1, Math.min(TOTAL_LEVELS, lvl));
    this.state.currentLevel = clamped;
    localStorage.setItem(KEY_CURRENT_LEVEL, clamped.toString());
    this.notify();
  }

  public unlockNextLevel(completedLevel: number) {
    const nextLevel = completedLevel + 1;
    if (nextLevel > this.state.highestUnlockedLevel && nextLevel <= TOTAL_LEVELS) {
      this.state.highestUnlockedLevel = nextLevel;
      localStorage.setItem(KEY_HIGHEST_UNLOCKED, nextLevel.toString());
    }
    if (completedLevel === this.state.currentLevel && nextLevel <= TOTAL_LEVELS) {
      this.setCurrentLevel(nextLevel);
    }
    this.notify();
  }

  public recordLevelResult(level: number, stars: number, score: number, _moves: number) {
    const oldStars = this.getStarsForLevel(level);
    const bestStars = Math.max(oldStars, stars);
    localStorage.setItem(`${KEY_STARS_PREFIX}${level}`, bestStars.toString());
    localStorage.setItem(`${KEY_SCORE_PREFIX}${level}`, score.toString());

    this.state.totalScore += score;
    localStorage.setItem(KEY_TOTAL_SCORE, this.state.totalScore.toString());

    this.unlockNextLevel(level);
    if (this.state.isLoggedIn) {
      this.syncCloudProgress();
    }
    this.notify();
  }

  public getStarsForLevel(level: number): number {
    const val = localStorage.getItem(`${KEY_STARS_PREFIX}${level}`);
    return val ? parseInt(val, 10) : 0;
  }

  public getScoreForLevel(level: number): number {
    const val = localStorage.getItem(`${KEY_SCORE_PREFIX}${level}`);
    return val ? parseInt(val, 10) : 0;
  }

  public isLevelUnlocked(_level: number): boolean {
    return true; // All levels 1-500 are permanently unlocked
  }

  public decrementLife() {
    // No life penalty - players enjoy unlimited smooth fast gameplay
  }

  public restoreLives(_count: number = MAX_LIVES) {
    this.state.lives = MAX_LIVES;
    this.notify();
  }

  public setSoundEnabled(enabled: boolean) {
    this.state.soundEnabled = enabled;
    localStorage.setItem(KEY_SOUND, enabled.toString());
    this.notify();
  }

  public setMusicEnabled(enabled: boolean) {
    this.state.musicEnabled = enabled;
    localStorage.setItem(KEY_MUSIC, enabled.toString());
    this.notify();
  }

  public setVibrationEnabled(enabled: boolean) {
    this.state.vibrationEnabled = enabled;
    localStorage.setItem(KEY_VIBRATION, enabled.toString());
    this.notify();
  }

  public setDarkTheme(dark: boolean | null) {
    this.state.darkTheme = dark;
    if (dark === null) {
      localStorage.removeItem(KEY_DARK_THEME);
    } else {
      localStorage.setItem(KEY_DARK_THEME, dark.toString());
    }
    this.notify();
  }

  public setGameBoardOpacity(opacity: number) {
    const clamped = Math.max(0.15, Math.min(1.0, opacity));
    this.state.gameBoardOpacity = clamped;
    localStorage.setItem(KEY_BOARD_OPACITY, clamped.toString());
    this.notify();
  }

  public setGameBoardTheme(theme: string) {
    this.state.gameBoardTheme = theme;
    localStorage.setItem(KEY_BOARD_THEME, theme);
    this.notify();
  }

  public login(account: UserAccount) {
    const syncedLevel = Math.max(this.state.highestUnlockedLevel, account.lastSyncedLevel);
    const syncedScore = Math.max(this.state.totalScore, account.lastSyncedScore);

    if (syncedLevel > this.state.highestUnlockedLevel) {
      this.state.highestUnlockedLevel = syncedLevel;
      localStorage.setItem(KEY_HIGHEST_UNLOCKED, syncedLevel.toString());
      if (syncedLevel > this.state.currentLevel) {
        this.setCurrentLevel(syncedLevel);
      }
    }
    if (syncedScore > this.state.totalScore) {
      this.state.totalScore = syncedScore;
      localStorage.setItem(KEY_TOTAL_SCORE, syncedScore.toString());
    }

    const updatedAccount: UserAccount = {
      ...account,
      lastSyncedLevel: syncedLevel,
      lastSyncedScore: syncedScore,
    };

    this.state.currentUser = updatedAccount;
    this.state.isLoggedIn = true;
    localStorage.setItem(KEY_AUTH_USER, JSON.stringify(updatedAccount));
    this.notify();
  }

  public logout() {
    this.state.currentUser = null;
    this.state.isLoggedIn = false;
    localStorage.removeItem(KEY_AUTH_USER);
    this.notify();
  }

  public syncCloudProgress() {
    if (!this.state.currentUser) return;
    const currentHigh = this.state.highestUnlockedLevel;
    const currentScore = this.state.totalScore;
    const updated: UserAccount = {
      ...this.state.currentUser,
      lastSyncedLevel: currentHigh,
      lastSyncedScore: currentScore,
    };
    this.state.currentUser = updated;
    localStorage.setItem(KEY_AUTH_USER, JSON.stringify(updated));
    this.notify();
  }

  public addStreakBonus() {
    this.state.streakDays += 1;
    localStorage.setItem(KEY_STREAK_DAYS, this.state.streakDays.toString());
    this.notify();
  }

  private checkDailyStreak() {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem(KEY_LAST_PLAYED);
    if (!lastDate) {
      localStorage.setItem(KEY_LAST_PLAYED, todayStr);
      localStorage.setItem(KEY_STREAK_DAYS, '1');
      this.state.streakDays = 1;
    } else if (lastDate !== todayStr) {
      try {
        const lastTime = new Date(lastDate).getTime();
        const todayTime = new Date(todayStr).getTime();
        const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          this.state.streakDays += 1;
          localStorage.setItem(KEY_LAST_PLAYED, todayStr);
          localStorage.setItem(KEY_STREAK_DAYS, this.state.streakDays.toString());
        } else if (diffDays > 1) {
          this.state.streakDays = 1;
          localStorage.setItem(KEY_LAST_PLAYED, todayStr);
          localStorage.setItem(KEY_STREAK_DAYS, '1');
        }
      } catch {}
    }
  }
}

export const preferences = PreferencesRepository.get();
