import { audioPlan, type PlanNote, type Voice } from '../engine/engine';
import { AUDIO_READY_TIMEOUT, ENVELOPES, FILTER_Q, FREQUENCIES, GLIDE_SECONDS, MASTER_VOLUME, RELEASE_CONSTANT, SAW_RATIO } from './tuning';

export interface ScheduledNote { time: number; frequency: number; previousFrequency?: number; attack: boolean; strength: 0 | 1 | 2; peak: number; sustain: number; attackSeconds: number; decay: number; bright: number; base: number }
export interface ScheduledVoice { start: number; end: number; stop: number; notes: ScheduledNote[] }
/** Pure scheduling conversion is tested separately from browser audio nodes. */
export function voiceSchedule(voices: Voice[]): ScheduledVoice[] {
  return voices.map(voice => ({ start: voice.start, end: voice.end, stop: voice.end + 0.2,
    notes: voice.notes.map((note, i) => {
      const e = ENVELOPES[note.str];
      return { time: note.time, frequency: FREQUENCIES[note.pitch], previousFrequency: i > 0 ? FREQUENCIES[voice.notes[i - 1].pitch] : undefined,
        attack: note.attack, strength: note.str, peak: e.peak, sustain: e.sustain, attackSeconds: e.attack, decay: e.decay, bright: e.bright, base: e.base };
    }),
  }));
}

let audioContext: AudioContext | null = null;
let master: GainNode | null = null;
export async function readyAudio(): Promise<AudioContext | null> {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioContext || audioContext.state === 'closed') {
      const w = window as typeof window & { webkitAudioContext?: typeof AudioContext };
      const Constructor = w.AudioContext || w.webkitAudioContext;
      if (!Constructor) return null;
      try {
        const n = navigator as Navigator & { audioSession?: { type: string } };
        if (n.audioSession) n.audioSession.type = 'playback';
      } catch { /* Unsupported audio session access should never prevent silent play. */ }
      audioContext = new Constructor();
      master = audioContext.createGain();
      master.gain.value = MASTER_VOLUME;
      master.connect(audioContext.destination);
    }
    const context = audioContext;
    if (context.state !== 'running') {
      let timer: ReturnType<typeof setTimeout> | undefined;
      await Promise.race([context.resume(), new Promise<void>(resolve => { timer = setTimeout(resolve, AUDIO_READY_TIMEOUT); })]);
      if (timer) clearTimeout(timer);
    }
    return context.state === 'running' ? context : null;
  } catch { return null; }
}

export interface Playback { stop(): void }
export function scheduleVoices(context: AudioContext, notes: PlanNote[], startAt: number): Playback {
  if (!master || context !== audioContext) return { stop() {} };
  const voices = voiceSchedule(audioPlan(notes));
  const active: { oscillators: OscillatorNode[]; amp: GainNode; nodes: AudioNode[] }[] = [];
  for (const voice of voices) {
    const triangle = context.createOscillator(); triangle.type = 'triangle';
    const saw = context.createOscillator(); saw.type = 'sawtooth';
    const sawGain = context.createGain(); sawGain.gain.value = SAW_RATIO;
    const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.Q.value = FILTER_Q;
    const amp = context.createGain(); amp.gain.value = 0;
    triangle.connect(filter); saw.connect(sawGain); sawGain.connect(filter); filter.connect(amp); amp.connect(master);
    const nodes = [triangle, saw, sawGain, filter, amp];
    active.push({ oscillators: [triangle, saw], amp, nodes });
    let ended = 0;
    for (const oscillator of [triangle, saw]) oscillator.onended = () => {
      ended++;
      if (ended === 2) for (const node of nodes) { try { node.disconnect(); } catch {} }
    };
    for (const note of voice.notes) {
      const time = startAt + note.time;
      if (note.attack) {
        triangle.frequency.setValueAtTime(note.frequency, time); saw.frequency.setValueAtTime(note.frequency, time);
        amp.gain.setValueAtTime(0, time);
        amp.gain.linearRampToValueAtTime(note.peak, time + note.attackSeconds);
        amp.gain.setTargetAtTime(note.sustain, time + note.attackSeconds, note.decay);
      } else {
        for (const oscillator of [triangle, saw]) {
          oscillator.frequency.setValueAtTime(note.previousFrequency ?? note.frequency, time);
          oscillator.frequency.exponentialRampToValueAtTime(note.frequency, time + GLIDE_SECONDS);
        }
        if (note.strength > 0) {
          amp.gain.setTargetAtTime(note.peak, time, 0.006);
          amp.gain.setTargetAtTime(note.sustain, time + GLIDE_SECONDS, note.decay);
        } else amp.gain.setTargetAtTime(ENVELOPES[0].sustain, time, GLIDE_SECONDS);
      }
      filter.frequency.setValueAtTime(note.bright, time);
      filter.frequency.setTargetAtTime(note.base, time + 0.01, note.decay * 1.3);
    }
    amp.gain.setTargetAtTime(0, startAt + voice.end, RELEASE_CONSTANT);
    for (const oscillator of [triangle, saw]) {
      oscillator.start(startAt + voice.start); oscillator.stop(startAt + voice.stop);
    }
  }
  let stopped = false;
  return { stop() {
    if (stopped) return; stopped = true;
    for (const voice of active) {
      try {
        voice.amp.gain.cancelScheduledValues(context.currentTime);
        voice.amp.gain.setTargetAtTime(0, context.currentTime, 0.01);
        for (const oscillator of voice.oscillators) oscillator.stop(context.currentTime + 0.08);
      } catch { /* An oscillator may already have ended. */ }
    }
  } };
}
