'use client';
import { useCallback, useEffect, useRef } from 'react';
import { BEAT, GEOM, onoOf, plan, poseAt, type PlanNote, type Spec } from '../engine/engine';
import { readyAudio, scheduleVoices, type Playback } from '../audio/synth';
import { MAX_OUTPUT_LATENCY, SCHEDULE_LEAD } from '../audio/tuning';
import { GROUND, LANE_TOP, X } from './geom';

interface Options { soundOn: boolean; reducedMotion: boolean; storm: boolean; onStart(spec: Spec): void; onDone?(): void; onPlaying?(playing: boolean): void; onAudioFailure?(): void }
interface Control { dead: boolean; frame: number; audio?: Playback }
const NS = 'http://www.w3.org/2000/svg';
function svgElement<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}
function clearGroup(group: SVGGElement | null) {
  if (!group) return;
  for (const node of group.querySelectorAll('*')) for (const animation of node.getAnimations()) animation.cancel();
  group.replaceChildren();
}
export function useWalk(options: Options) {
  const latest = useRef(options);
  useEffect(() => { latest.current = options; }, [options]);
  const characterRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const revealRef = useRef<SVGRectElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const onoRef = useRef<SVGGElement>(null);
  const fxRef = useRef<SVGGElement>(null);
  const control = useRef<Control | null>(null);
  const warned = useRef(false);
  const stop = useCallback(() => {
    const current = control.current;
    if (current) {
      current.dead = true;
      cancelAnimationFrame(current.frame);
      current.audio?.stop();
      control.current = null;
      latest.current.onPlaying?.(false);
    }
    clearGroup(onoRef.current); clearGroup(fxRef.current);
    for (const animation of worldRef.current?.getAnimations() ?? []) animation.cancel();
  }, []);
  useEffect(() => {
    const hidden = () => { if (document.hidden) stop(); };
    window.addEventListener('popstate', stop);
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', hidden);
    return () => { window.removeEventListener('popstate', stop); window.removeEventListener('pagehide', stop); document.removeEventListener('visibilitychange', hidden); stop(); };
  }, [stop]);

  const walk = useCallback(async (spec: Spec): Promise<boolean> => {
    stop();
    const current: Control = { dead: false, frame: 0 };
    control.current = current;
    const opts = latest.current;
    const notes = plan(spec);
    opts.onStart(spec); opts.onPlaying?.(true);
    revealRef.current?.setAttribute('width', '0');
    characterRef.current?.setAttribute('transform', `translate(${GEOM.START_X} ${GROUND})`);
    bodyRef.current?.setAttribute('transform', '');
    const audio = opts.soundOn ? await readyAudio() : null;
    if (current.dead) return false;
    if (opts.soundOn && !audio && !warned.current) { warned.current = true; opts.onAudioFailure?.(); }
    let firstBeat = performance.now() / 1000 + GEOM.LEAD + SCHEDULE_LEAD;
    if (audio) {
      try {
        current.audio = scheduleVoices(audio, notes, audio.currentTime + GEOM.LEAD + SCHEDULE_LEAD);
        firstBeat += Math.min(MAX_OUTPUT_LATENCY, audio.outputLatency || audio.baseLatency || 0);
      } catch { if (!warned.current) { warned.current = true; opts.onAudioFailure?.(); } }
    }
    const reduced = opts.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let previous = -1; let slide = 0;
    const onset = (note: PlanNote) => {
      if (latest.current.storm) return;
      const word = onoOf(note);
      if (word && onoRef.current) {
        const text = svgElement('text', { x: X(note.i) - 3, y: LANE_TOP + 23, fill: word.size === 2 ? 'var(--accent, #E4572E)' : 'var(--ink, #1B2145)',
          'font-family': 'Bagel Fat One,sans-serif', 'font-size': word.size === 2 ? 25 : word.size === 1 ? 22 : 19 });
        text.textContent = word.text; onoRef.current.append(text);
        const animation = text.animate(reduced ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, offset: .12 }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 620, fill: 'forwards' });
        void animation.finished.then(() => text.remove()).catch(() => {});
      }
      if (note.str > 0 && !reduced && fxRef.current) {
        const count = note.str === 1 ? 3 : 6;
        for (let k = 0; k < count; k++) {
          const side = k % 2 ? 1 : -1;
          const far = 6 + 5 * Math.floor(k / 2) + (note.str === 2 ? 4 : 0);
          const circle = svgElement('circle', { cx: X(note.i) + side * 4, cy: GROUND - 2, r: note.str === 2 ? 3 : 2.3, fill: 'var(--paper, #FFFFFF)', stroke: 'var(--border, #C9D2EA)', 'stroke-width': .5 });
          fxRef.current.append(circle);
          const animation = circle.animate([{ opacity: 1, transform: 'translate(0px,0px)' }, { opacity: 0, transform: `translate(${side * far}px,${-(7 + 3 * (k % 3)) - (note.str === 2 ? 4 : 0)}px)` }], { duration: 430, fill: 'forwards', easing: 'ease-out' });
          void animation.finished.then(() => circle.remove()).catch(() => {});
        }
        if (note.str === 2) worldRef.current?.animate([{ transform: 'translateX(0px)' }, { transform: 'translateX(-2px)' }, { transform: 'translateX(2px)' }, { transform: 'translateX(0px)' }], { duration: 200 });
      }
    };
    const frame = () => {
      if (current.dead) return;
      const time = performance.now() / 1000 - firstBeat;
      const pose = poseAt(notes, time);
      slide += (pose.slide - slide) * .4;
      characterRef.current?.setAttribute('transform', reduced ? `translate(${pose.x} ${GROUND})` : `translate(${pose.x - 13 * slide} ${GROUND - pose.lift - 10.5 * slide})`);
      bodyRef.current?.setAttribute('transform', reduced ? '' : `rotate(${78 * slide}) scale(${pose.sx} ${pose.sy})`);
      revealRef.current?.setAttribute('width', String(time < 0 ? 0 : pose.x + 1));
      const index = Math.min(3, Math.floor(time / BEAT));
      if (time >= 0) while (previous < index) onset(notes[++previous]);
      if (time > 4 * BEAT + .4) {
        revealRef.current?.setAttribute('width', '360');
        characterRef.current?.setAttribute('transform', `translate(${GEOM.X0 + 4 * GEOM.W} ${GROUND})`);
        bodyRef.current?.setAttribute('transform', '');
        control.current = null;
        opts.onPlaying?.(false); opts.onDone?.();
        return;
      }
      current.frame = requestAnimationFrame(frame);
    };
    current.frame = requestAnimationFrame(frame);
    return !opts.soundOn || Boolean(audio);
  }, [stop]);
  return { characterRef, bodyRef, revealRef, worldRef, onoRef, fxRef, walk, stop };
}
