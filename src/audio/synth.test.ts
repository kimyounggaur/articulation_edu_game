import { describe, expect, it } from 'vitest';
import { audioPlan, plan, specOf, type Kind } from '../engine/engine';
import { voiceSchedule } from './synth';
import { BEAT } from '../engine/engine';
const score = (kind?: Kind) => specOf(kind ? [{ kind, scope: 'ALL' }] : [], 0);
describe('synthesis schedule from the shared engine plan', () => {
  it.each([['none', .65], ['stac', .3], ['ten', .92]] as const)('%s has four separately released voices', (kind, ratio) => {
    const voices = voiceSchedule(audioPlan(plan(score(kind === 'none' ? undefined : kind))));
    expect(voices).toHaveLength(4);
    expect(voices[3].end).toBeCloseTo((3 + ratio) * BEAT);
    expect(voices.every(voice => voice.notes[0].attack)).toBe(true);
  });
  it('legato has one voice and glides without repeated attacks', () => {
    const voices = voiceSchedule(audioPlan(plan(score('leg'))));
    expect(voices).toHaveLength(1);
    expect(voices[0].notes.map(note => note.attack)).toEqual([true, false, false, false]);
    expect(voices[0].end).toBeCloseTo(3.65 * BEAT);
    expect(voices[0].notes[1].previousFrequency).toBe(523.25);
  });
  it('accent and marcato increase onset peak without changing duration', () => {
    const normal = voiceSchedule(audioPlan(plan(score())))[0];
    const accent = voiceSchedule(audioPlan(plan(score('acc'))))[0];
    const marcato = voiceSchedule(audioPlan(plan(score('marc'))))[0];
    expect([normal.notes[0].peak, accent.notes[0].peak, marcato.notes[0].peak]).toEqual([.26, .50, .80]);
    expect(accent.end).toBe(normal.end); expect(marcato.end).toBe(normal.end);
    expect(marcato.notes[0].bright).toBe(6500);
  });
  it('leaves a release tail after sound duration', () => {
    const voice = voiceSchedule(audioPlan(plan(score())))[0];
    expect(voice.stop - voice.end).toBeCloseTo(.2);
  });
});
