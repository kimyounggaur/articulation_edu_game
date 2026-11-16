/** All audio tuning values live here; notation duration and strength remain in the engine. */
export const MASTER_VOLUME = 0.85;
export const SAW_RATIO = 0.16;
export const FILTER_Q = 0.6;
export const RELEASE_CONSTANT = 0.012;
export const GLIDE_SECONDS = 0.03;
export const AUDIO_READY_TIMEOUT = 300;
export const MAX_OUTPUT_LATENCY = 0.25;
export const SCHEDULE_LEAD = 0.06;
export const FREQUENCIES = { B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25 } as const;
export const ENVELOPES = [
  { peak: 0.26, sustain: 0.22, attack: 0.012, decay: 0.06, bright: 1700, base: 1500 },
  { peak: 0.50, sustain: 0.25, attack: 0.006, decay: 0.09, bright: 3800, base: 1600 },
  { peak: 0.80, sustain: 0.28, attack: 0.004, decay: 0.11, bright: 6500, base: 1800 },
] as const;
