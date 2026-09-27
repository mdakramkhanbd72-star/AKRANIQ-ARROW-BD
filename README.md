# Akraniq Arrow Escape (আকরানিক অ্যারো এস্কেপ)

A modern, high-performance procedural Arrow Puzzle Escape game built with **React 19**, **TypeScript**, **HTML5 Canvas**, and **Tailwind CSS**, pre-configured with **Google AdMob** monetization.

---

## 📁 Project Folder Structure

```text
├── index.html                           # App entry HTML with Google AdMob script tags
├── package.json                         # Dependencies and npm scripts
├── tsconfig.json                        # TypeScript configuration
├── vite.config.ts                       # Vite bundling configuration
├── metadata.json                        # Applet metadata
├── README.md                            # Complete documentation & guide
└── src/
    ├── main.tsx                         # React entrypoint
    ├── App.tsx                          # App container, screen router & AdMob overlay
    ├── index.css                        # Tailwind CSS imports & animations
    ├── core/
    │   ├── constants.ts                 # Level difficulty curves, scoring algorithms, constants
    │   └── themes.ts                    # Board color palettes & themes
    ├── types/
    │   └── game.ts                      # Core models: Arrow, Level, Animation, Theme, State
    ├── services/
    │   ├── adService.ts                 # Google AdMob service (Interstitial & Rewarded ads)
    │   ├── levelGenerator.ts            # 500+ deterministic procedural level generator
    │   ├── preferences.ts               # LocalStorage repository, daily streak & score tracking
    │   └── soundManager.ts              # Web Audio API procedural sound synthesizer & haptics
    ├── components/
    │   ├── AdMobOverlay.tsx             # Interactive, cross-platform Google AdMob interstitial/rewarded UI
    │   ├── ArrowBoardView.tsx           # High-precision HTML5 Canvas board with sub-pixel touch detection
    │   ├── GameModals.tsx               # Level Complete & Deadlock modals with Rewarded Ad unblock
    │   ├── InGameDisplaySettingsDialog.tsx # Opacity and theme switcher modal
    │   ├── LivesBar.tsx                 # Lives indicator component
    │   ├── MazeBackground.tsx           # Subtle maze vector background pattern
    │   ├── StreakBadge.tsx              # Daily streak flame indicator
    │   └── AuthDialog.tsx               # User account modal
    └── screens/
        ├── MainMenuScreen.tsx           # Main menu with play button, streak bonus rewarded ad
        ├── GameScreen.tsx               # Core gameplay view with zoom/pan controls, restart & magic hints
        ├── LevelSelectScreen.tsx        # Grid level browser (levels 1 - 500)
        └── SettingsScreen.tsx           # Sound, dark mode, board styling & preferences screen
```

---

## 💰 Google AdMob Integration Details

This project is configured with official AdMob publisher and ad units:

| Setting / Unit | ID | Purpose |
|---|---|---|
| **AdMob App ID** | `ca-app-pub-1737752929640330~9900507873` | Registered in Google AdMob |
| **Publisher ID** | `ca-app-pub-1737752929640330` | In `index.html` & `adService.ts` |
| **Interstitial Ad** | `ca-app-pub-1737752929640330/6919121316` | Triggers every 2 levels upon level completion |
| **Rewarded Video Ad** | `ca-app-pub-1737752929640330/8719288146` | Unblocks deadlocks, gives magic hints & daily streak boosts |

### Supported Ad Delivery Modes:
1. **Web / Mobile PWA**: Uses client Google Ads SDK and interactive in-app reward video overlay (`AdMobOverlay.tsx`).
2. **Android Native / Capacitor / Cordova**: Automatically detects native bridge (`window.AndroidAdMob` / `window.AdMob`) and dispatches native interstitial and rewarded videos.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (version 18 or higher)
- npm or bun

### 2. Installation
```bash
npm install
```

### 3. Development Server
Run the local development server on port 3000:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

---

## 🎮 Gameplay Features
- **500 Unique Procedural Levels**: Deterministic level generator with increasing board dimensions (6x6 up to 16x16) and complexity.
- **Smart Touch Hit-Testing**: Distance-based subpixel touch detection for mobile screens to eliminate accidental misclicks.
- **Interactive Audio & Haptics**: Procedural synthesized Web Audio FX (pop, whoosh, chimes, blocked clicks).
- **Themes & Contrast Customization**: 6 palette presets (Sage, Obsidian, Neon Cyber, Sunset, Ocean, Amber) with real-time board grid opacity adjustment.
