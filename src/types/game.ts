export type ArrowDirectionType = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface ArrowDirectionInfo {
  name: ArrowDirectionType;
  dRow: number;
  dCol: number;
  rotationDegrees: number;
  symbol: string;
}

export const ARROW_DIRECTIONS: Record<ArrowDirectionType, ArrowDirectionInfo> = {
  UP: { name: 'UP', dRow: -1, dCol: 0, rotationDegrees: 270, symbol: '↑' },
  DOWN: { name: 'DOWN', dRow: 1, dCol: 0, rotationDegrees: 90, symbol: '↓' },
  LEFT: { name: 'LEFT', dRow: 0, dCol: -1, rotationDegrees: 180, symbol: '←' },
  RIGHT: { name: 'RIGHT', dRow: 0, dCol: 1, rotationDegrees: 0, symbol: '→' },
};

export type ArrowState = 'IDLE' | 'SLIDING' | 'BLOCKED' | 'EXITED' | 'LOCKED';
export type SnakeMechanic = 'STANDARD' | 'COLOR_LOCK';

export interface ArrowModel {
  id: string;
  row: number;
  col: number;
  direction: ArrowDirectionType;
  state: ArrowState;
  isPartOfPattern: boolean;
  mechanic: SnakeMechanic;
  colorGroup?: number | null;
  path: [number, number][]; // [row, col], path[0] is head
}

export type MaskShape =
  | 'SQUARE'
  | 'LONG_RECTANGLE'
  | 'CIRCLE'
  | 'HEART'
  | 'STAR'
  | 'DIAMOND'
  | 'HEXAGON'
  | 'BLOB'
  | 'CROSS'
  | 'CHEVRON'
  | 'CROWN'
  | 'CRESCENT';

export type Difficulty =
  | 'Tutorial'
  | 'Easy'
  | 'Medium'
  | 'Hard'
  | 'Expert'
  | 'Master'
  | 'Legend';

export type LevelType = 'TUTORIAL' | 'NORMAL' | 'BOSS' | 'GOD';

export interface LevelModel {
  levelNumber: number;
  gridSize: number;
  arrows: ArrowModel[];
  patternName: string;
  difficulty: Difficulty;
  solutionOrder: string[];
  maskShape: MaskShape;
  mask: Set<string>; // "r,c"
}

export type AuthProvider = 'GOOGLE' | 'FACEBOOK' | 'EMAIL' | 'PHONE';

export interface UserAccount {
  id: string;
  displayName: string;
  identifier: string;
  provider: AuthProvider;
  joinedTimestamp: number;
  lastSyncedLevel: number;
  lastSyncedScore: number;
}

export interface GameThemePalette {
  id: string;
  displayName: string;
  primaryColor: string;
  cellColorLight: string;
  cellColorDark: string;
  arrowColorLight: string;
  arrowColorDark: string;
  laserCoreColor: string;
  laserGlowColor: string;
}

export interface SlidingArrowAnimation {
  arrowId: string;
  waypoints: [number, number][]; // [row, col] floating coordinates
  progress: number; // 0 to 1
}
