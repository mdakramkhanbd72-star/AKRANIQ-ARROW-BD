import { LevelType } from '../types/game';

export const APP_NAME = 'Akraniq Arrow';
export const MAX_LIVES = 3;
export const TUTORIAL_LEVELS = 3;
export const TOTAL_LEVELS = 500;

export function levelTypeFor(level: number): LevelType {
  if (level <= TUTORIAL_LEVELS) return 'TUTORIAL';
  const pos = ((level - TUTORIAL_LEVELS - 1) % 7) + 1;
  if (pos === 7) return 'GOD';
  if (pos === 4) return 'BOSS';
  return 'NORMAL';
}

export function isBossLevel(level: number): boolean {
  return levelTypeFor(level) === 'BOSS';
}

export function isGodLevel(level: number): boolean {
  return levelTypeFor(level) === 'GOD';
}

export function calculateScore(level: number, remainingLives: number, moves: number): number {
  const type = levelTypeFor(level);
  const baseScore = 100;
  const typeBonus = type === 'GOD' ? 500 : type === 'BOSS' ? 200 : 0;
  const lifeBonus = remainingLives * 50;
  const moveBonus = Math.max(0, 50 - moves * 2);
  return baseScore + typeBonus + lifeBonus + moveBonus;
}

export function calculateStars(remainingLives: number): number {
  return Math.min(3, Math.max(1, remainingLives));
}

export const GROUP_COLORS_LIGHT = [
  '#E50914',
  '#0055FF',
  '#00A859',
  '#8E24AA',
  '#FF6D00',
  '#00B4D8',
  '#FF2A8D',
  '#FFA000',
  '#558B2F',
  '#00897B',
  '#3D5AFE',
  '#C2185B',
];

export const GROUP_COLORS_DARK = [
  '#FF2A4B',
  '#2979FF',
  '#00E676',
  '#D500F9',
  '#FF8B00',
  '#00E5FF',
  '#FF52A1',
  '#FFD600',
  '#AEEA00',
  '#1DE9B6',
  '#7575FF',
  '#FF4081',
];

export function getGroupColor(index: number, isDark: boolean): string {
  const list = isDark ? GROUP_COLORS_DARK : GROUP_COLORS_LIGHT;
  return list[Math.abs(index) % list.length];
}
