class SoundManager {
  private static instance: SoundManager | null = null;
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private vibrationEnabled: boolean = true;
  private musicOscillators: OscillatorNode[] = [];
  private musicGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;

  private constructor() {
    // Lazy AudioContext on first user interaction
  }

  public static get(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initAudio() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public updateSettings(sound: boolean, music: boolean, vibration: boolean) {
    this.soundEnabled = sound;
    this.musicEnabled = music;
    this.vibrationEnabled = vibration;

    if (!this.musicEnabled) {
      this.pauseMusic();
    } else {
      this.startMusic();
    }
  }

  public playClick() {
    this.vibrateLight();
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.05);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
    } catch {
      // Audio error handled silently
    }
  }

  public playArrowExit() {
    this.vibrateMedium();
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;

      // Resonant swoosh laser sound
      const osc = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.18);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.28);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220, t);
      osc2.frequency.exponentialRampToValueAtTime(700, t + 0.18);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + 0.34);
      osc2.stop(t + 0.34);
    } catch {
      // Audio error handled silently
    }
  }

  public playBlocked() {
    this.vibrateHeavy();
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;

      // Thud bounce blocked sound
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);

      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch {
      // Audio error handled silently
    }
  }

  public playLevelSuccess() {
    this.vibrateLight();
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const noteTime = t + i * 0.08;
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.25, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.32);
      });
    } catch {
      // Handled silently
    }
  }

  public startMusic() {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      this.isMusicPlaying = true;
      const chords = [
        [220, 277.18, 329.63, 440], // A Major
        [196, 246.94, 293.66, 392], // G Major
        [174.61, 220, 261.63, 349.23], // F Major
        [164.81, 207.65, 246.94, 329.63], // E minor
      ];
      let chordIndex = 0;

      const playChord = () => {
        if (!this.isMusicPlaying || !this.audioCtx || !this.musicEnabled) return;
        const chord = chords[chordIndex % chords.length];
        chordIndex++;
        const now = this.audioCtx.currentTime;
        const chordDuration = 4.2;

        const masterGain = this.audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.08, now + 1.2);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + chordDuration);

        chord.forEach((freq) => {
          const osc = this.audioCtx!.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          osc.connect(masterGain);
          osc.start(now);
          osc.stop(now + chordDuration + 0.2);
        });

        masterGain.connect(this.audioCtx.destination);
        this.musicTimer = window.setTimeout(playChord, (chordDuration - 0.6) * 1000);
      };

      playChord();
    } catch {
      // Audio error handled silently
    }
  }

  public pauseMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private vibrateLight() {
    if (this.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  }

  private vibrateMedium() {
    if (this.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(35);
      } catch {}
    }
  }

  private vibrateHeavy() {
    if (this.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([40, 50, 40]);
      } catch {}
    }
  }
}

export const soundManager = SoundManager.get();
