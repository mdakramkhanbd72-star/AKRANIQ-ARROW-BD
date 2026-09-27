import { GameThemePalette } from '../types/game';

export const GAME_THEMES: GameThemePalette[] = [
  {
    id: 'SAGE',
    displayName: 'Sage Emerald',
    primaryColor: '#4A7C59',
    cellColorLight: '#E4E9E2',
    cellColorDark: '#242C23',
    arrowColorLight: '#2E4E38',
    arrowColorDark: '#E2EFE5',
    laserCoreColor: '#00E676',
    laserGlowColor: 'rgba(0, 230, 118, 0.6)',
  },
  {
    id: 'CYBER_NEON',
    displayName: 'Cyber Neon',
    primaryColor: '#00B0FF',
    cellColorLight: '#E1F5FE',
    cellColorDark: '#10202B',
    arrowColorLight: '#0277BD',
    arrowColorDark: '#80D8FF',
    laserCoreColor: '#00E5FF',
    laserGlowColor: 'rgba(0, 176, 255, 0.6)',
  },
  {
    id: 'SUNSET_AMBER',
    displayName: 'Sunset Amber',
    primaryColor: '#FF9100',
    cellColorLight: '#FFF3E0',
    cellColorDark: '#2E2218',
    arrowColorLight: '#D84315',
    arrowColorDark: '#FFCC80',
    laserCoreColor: '#FFAB00',
    laserGlowColor: 'rgba(255, 109, 0, 0.6)',
  },
  {
    id: 'ROYAL_VIOLET',
    displayName: 'Royal Violet',
    primaryColor: '#9C27B0',
    cellColorLight: '#F3E5F5',
    cellColorDark: '#27172E',
    arrowColorLight: '#6A1B9A',
    arrowColorDark: '#E1BEE7',
    laserCoreColor: '#E040FB',
    laserGlowColor: 'rgba(170, 0, 255, 0.6)',
  },
  {
    id: 'CRIMSON_RUBY',
    displayName: 'Crimson Ruby',
    primaryColor: '#FF1744',
    cellColorLight: '#FFEBEE',
    cellColorDark: '#33161A',
    arrowColorLight: '#C2185B',
    arrowColorDark: '#FF80AB',
    laserCoreColor: '#FF5252',
    laserGlowColor: 'rgba(255, 23, 68, 0.6)',
  },
  {
    id: 'HIGH_CONTRAST',
    displayName: 'High Contrast',
    primaryColor: '#616161',
    cellColorLight: '#E0E0E0',
    cellColorDark: '#1E1E1E',
    arrowColorLight: '#111111',
    arrowColorDark: '#FFFFFF',
    laserCoreColor: '#FFFF00',
    laserGlowColor: 'rgba(255, 214, 0, 0.6)',
  },
];

export function getThemeById(id: string): GameThemePalette {
  return (
    GAME_THEMES.find((t) => t.id.toLowerCase() === id.toLowerCase()) ||
    GAME_THEMES[0]
  );
}
