'use client';
import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { GEOM, plan, printShapes, type Shape, type Spec } from '../engine/engine';
import { Penguin } from '../art/Penguin';
import { GLYPHS } from './glyphs';
import { ACCENT_Y, CX, GROUND, HEIGHT, LANE_BOTTOM, LANE_TOP, PITCH_STEP, PRINT_Y, SCALE, SP, STAFF_TOP, X, pitchY } from './geom';
import { useWalk } from './useWalk';

export interface StageHandle { walk(spec?: Spec): Promise<boolean>; stop(): void }
export interface StageProps {
  spec: Spec; target?: Spec; targetOutline?: boolean; ghost?: Spec; hideMarks?: boolean; showLinks?: boolean;
  checks?: boolean[]; prints?: boolean; interactive?: 'notes' | 'links' | false;
  onNote?(index: number): void; onLink?(index: number): void; readCards?: string[]; readLinks?: boolean[]; ghostReadCards?: string[]; ghostReadLinks?: boolean[];
  storm?: boolean; soundOn?: boolean; reducedMotion?: boolean; onDone?(): void; onPlaying?(playing: boolean): void; onAudioFailure?(): void;
}
type GlyphName = keyof typeof GLYPHS;
const ORD = ['첫째', '둘째', '셋째', '넷째'];
const names = { none: '보통 걸음', stac: '스타카토', ten: '테누토', acc: '악센트', marc: '마르카토' } as const;
function Glyph({ name, x, y, centered = false }: { name: GlyphName; x: number; y: number; centered?: boolean }) {
  const glyph = GLYPHS[name]; const b = glyph.bbox;
  const left = centered ? x - (b[2] - b[0]) * SCALE / 2 - b[0] * SCALE : x;
  return <path d={glyph.d} transform={`translate(${left} ${y}) scale(${SCALE})`} fill="currentColor" />;
}
const markTop = (spec: Spec, i: number) => spec.marks[i] === 'acc' || spec.marks[i] === 'marc' ? ACCENT_Y - 11.5 : pitchY(spec.pitches[i]) - SP / 2;
function slurPath(spec: Spec, a: number, b: number) {
  const xs = CX(a), xe = CX(b), ys = markTop(spec, a) - 3.5, ye = markTop(spec, b) - 3.5;
  let apex = Math.min(ys, ye);
  for (let i = a; i <= b; i++) apex = Math.min(apex, markTop(spec, i) - 3.5);
  apex = Math.max(7, apex - 6 - (b - a) * 1.5);
  const c = (ys + ye) / 2 + (apex - (ys + ye) / 2) / .75;
  const c1 = xs + (xe - xs) * .25, c2 = xs + (xe - xs) * .75;
  return `M${xs} ${ys} C${c1} ${c - 1.7} ${c2} ${c - 1.7} ${xe} ${ye} C${c2} ${c + 1.3} ${c1} ${c + 1.3} ${xs} ${ys} Z`;
}
function Score({ spec, hideMarks = false, showLinks = false, marksOnly = false }: { spec: Spec; hideMarks?: boolean; showLinks?: boolean; marksOnly?: boolean }) {
  const slurs = [];
  if (!hideMarks) for (let a = 0; a < 3;) {
    if (!spec.links[a]) { a++; continue; }
    let b = a; while (b < 3 && spec.links[b]) b++;
    slurs.push(<path key={`slur${a}`} d={slurPath(spec, a, b)} fill="currentColor" />); a = b;
  }
  return <g>
    {spec.pitches.map((pitch, i) => {
      const y = pitchY(pitch), mark = spec.marks[i];
      const yc = y - (PITCH_STEP[pitch] % 2 === 1 ? SP : 1.5 * SP);
      return <g key={i}>
        {!marksOnly && <><Glyph name="noteheadBlack" x={X(i) + 10} y={y} /><rect x={X(i) + 10} y={y + 1.8} width={1.3} height={3.5 * SP - 1.8} fill="currentColor" /></>}
        {hideMarks ? <text x={CX(i)} y={STAFF_TOP - 11} textAnchor="middle" fontSize={18} fontWeight={700} fill="#A63F35">?</text> : <>
          {mark === 'stac' && <Glyph name="articStaccatoAbove" x={CX(i)} y={yc + 42 * SCALE} centered />}
          {mark === 'ten' && <Glyph name="articTenutoAbove" x={CX(i)} y={yc + 24 * SCALE} centered />}
          {mark === 'acc' && <Glyph name="articAccentAbove" x={CX(i)} y={ACCENT_Y} centered />}
          {mark === 'marc' && <Glyph name="articMarcatoAbove" x={CX(i)} y={ACCENT_Y} centered />}
        </>}
      </g>;
    })}
    {slurs}
    {showLinks && !hideMarks && [0, 1, 2].map(j => !spec.links[j] && <path key={j} d={`M${CX(j) + 3} ${markTop(spec, j) - 5} Q${(CX(j) + CX(j + 1)) / 2} ${Math.min(markTop(spec, j), markTop(spec, j + 1)) - 16} ${CX(j + 1) - 3} ${markTop(spec, j + 1) - 5}`} fill="none" stroke="#A63F35" strokeWidth={1.8} strokeDasharray="3 3" />)}
  </g>;
}
function PrintShape({ shape }: { shape: Shape }) {
  if (shape.k === 'bar') return <rect x={shape.x0} y={PRINT_Y - shape.th / 2} width={shape.x1 - shape.x0} height={shape.th} rx={shape.th / 2} />;
  if (shape.k === 'wedge') return <polygon points={`${shape.x0},${PRINT_Y - shape.h} ${shape.x1},${PRINT_Y - GEOM.TH / 2} ${shape.x1},${PRINT_Y + GEOM.TH / 2} ${shape.x0},${PRINT_Y + shape.h}`} />;
  return <g>{[[5, -21, 1.7], [12, -24, 1.3], [19, -19.5, 1.6], [8, 21.5, 1.5], [17, 23, 1.2]].map(([dx, dy, r], i) => <circle key={i} cx={shape.x + dx} cy={PRINT_Y + dy} r={r} />)}</g>;
}
function Prints({ spec }: { spec: Spec }) { return <>{printShapes(plan(spec)).map((shape, i) => <PrintShape key={i} shape={shape} />)}</>; }

export const Stage = forwardRef<StageHandle, StageProps>(function Stage({ spec, target, targetOutline = false, ghost, hideMarks = false, showLinks = false, checks, prints = false, interactive = false, onNote, onLink, readCards, readLinks, ghostReadCards, ghostReadLinks, storm = false, soundOn = false, reducedMotion = false, onDone, onPlaying, onAudioFailure }, ref) {
  const id = useId().replaceAll(':', '');
  const [playedSpec, setPlayedSpec] = useState<Spec | null>(null);
  const [animating, setAnimating] = useState(false);
  const activeSpec = useRef<Spec | null>(null);
  const begin = useCallback((input: Spec) => { activeSpec.current = input; setPlayedSpec(input); }, []);
  const playingChanged = useCallback((playing: boolean) => { if (!playing) activeSpec.current = null; setAnimating(playing); onPlaying?.(playing); }, [onPlaying]);
  const walk = useWalk({ soundOn, reducedMotion, storm, onStart: begin, onPlaying: playingChanged, onDone, onAudioFailure });
  const { walk: startWalk, stop: stopWalk } = walk;
  const resetPlayback = useCallback(() => { stopWalk(); activeSpec.current = null; setPlayedSpec(null); }, [stopWalk]);
  useImperativeHandle(ref, () => ({ walk: input => startWalk(input ?? spec), stop: resetPlayback }), [startWalk, resetPlayback, spec]);
  useEffect(() => {
    // A compare button sets the new score and starts it in the same event.
    // The score update belongs to that new playback and must not cancel it.
    if (activeSpec.current !== spec) resetPlayback();
  }, [spec, resetPlayback]);
  useEffect(() => { stopWalk(); }, [soundOn, stopWalk]);
  const concealed = hideMarks || storm;
  const outline = targetOutline || animating || Boolean(playedSpec);
  const description = concealed ? '4분음표 네 개. 표지판은 물음표로 가려져 있어요.' : `4분의 4박자 한 마디. ${spec.pitches.map((_, i) => `${ORD[i]} 음 ${names[spec.marks[i]]}`).join(', ')}${spec.links.some(Boolean) ? ', 이어진 음에는 이음줄이 있어요.' : '.'}`;
  const keyboard = (event: React.KeyboardEvent<SVGGElement>, callback: (() => void) | undefined) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback?.(); }
  };
  return <svg className="snow-stage" viewBox={`0 0 360 ${HEIGHT}`} style={{ display: 'block', width: '100%', height: 'auto', color: 'var(--ink, #1B2145)', overflow: 'visible' }} role={interactive ? 'group' : 'img'} aria-label={description}>
    <desc>위의 음표와 아래 눈길의 칸이 나란해요. 자국의 가로는 길이, 굵기는 세기예요.</desc>
    <defs><clipPath id={`reveal-${id}`}><rect ref={walk.revealRef} x={0} y={GROUND - 2} width={animating ? 0 : prints || playedSpec ? 360 : 0} height={HEIGHT - GROUND + 2} /></clipPath></defs>
    <g ref={walk.worldRef}>
      <rect x={6} y={LANE_TOP} width={348} height={LANE_BOTTOM - LANE_TOP} rx={14} fill="var(--snow, #E9EEF8)" />
      <path d={`M6 ${GROUND + 2} C60 ${GROUND - 4},112 ${GROUND + 3},180 ${GROUND} S300 ${GROUND - 3},354 ${GROUND + 1} V${LANE_BOTTOM - 14} a14 14 0 0 1 -14 14 H20 a14 14 0 0 1 -14 -14 Z`} fill="var(--paper, #FFFFFF)" />
      {[0, 1, 2, 3, 4].map(i => <line key={i} x1={X(i)} x2={X(i)} y1={GROUND + 7} y2={LANE_BOTTOM - 5} stroke="var(--border, #C9D2EA)" strokeDasharray="3 4" />)}
      <g visibility={storm ? 'hidden' : undefined} aria-hidden={storm || undefined}>
        {target && <g fill={outline ? 'none' : 'var(--print, #5B6CC4)'} stroke={outline ? 'var(--print, #5B6CC4)' : 'none'} strokeWidth={1.5} strokeDasharray={outline ? '3 2' : undefined} opacity={outline ? .8 : 1}><Prints spec={target} /></g>}
        <g clipPath={`url(#reveal-${id})`} fill="var(--print, #5B6CC4)">{(prints || playedSpec) && <Prints spec={playedSpec ?? spec} />}</g>
        {checks && checks.map((ok, i) => <g key={i}><circle cx={X(i) + GEOM.W / 2 - 6} cy={LANE_TOP + 12} r={8} fill={ok ? 'var(--success, #147A5E)' : 'var(--error, #B23A2B)'} /><text x={X(i) + GEOM.W / 2 - 6} y={LANE_TOP + 16} fontSize={12} fill="#fff" textAnchor="middle" fontWeight={700}>{ok ? '✓' : '✗'}</text></g>)}
        {readCards?.map((text, i) => text && !(readLinks && text === '스르륵') && <text key={i} x={X(i) + 13} y={153} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--ink, #1B2145)">{text}</text>)}
        {readLinks?.map((joined, i) => joined && <text key={`read-link-${i}`} x={(CX(i) + CX(i + 1)) / 2} y={153} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--ink, #1B2145)">스르륵</text>)}
        {ghostReadCards && <g opacity={.35} aria-label="흐리게 표시한 정답 걸음">
          {ghostReadCards.map((text, i) => text && !(ghostReadLinks && text === '스르륵') && <text key={i} x={X(i) + 13} y={139} textAnchor="middle" fontSize={11} fontWeight={700} fill="#A63F35">{text}</text>)}
          {ghostReadLinks?.map((joined, i) => joined && <text key={`ghost-read-link-${i}`} x={(CX(i) + CX(i + 1)) / 2} y={139} textAnchor="middle" fontSize={11} fontWeight={700} fill="#A63F35">스르륵</text>)}
        </g>}
        <g ref={walk.fxRef} />
        <g ref={walk.characterRef} transform={`translate(${GEOM.START_X} ${GROUND})`}><Penguin ref={walk.bodyRef} /></g>
        <g ref={walk.onoRef} />
      </g>
    </g>
    {storm && <g><rect x={6} y={LANE_TOP} width={348} height={LANE_BOTTOM - LANE_TOP} rx={14} fill="var(--snow, #E9EEF8)" /><path d="M15 144Q72 122 117 143T231 143T344 139M15 176Q86 156 147 173T344 170M18 202Q92 184 158 203T342 197" fill="none" stroke="var(--paper, #FFFFFF)" strokeWidth={5} strokeLinecap="round" opacity={.85} /><text x={180} y={167} textAnchor="middle" fontSize={14} fill="var(--ink, #1B2145)">눈보라 속 소리에 귀 기울여요</text></g>}
    <g stroke="var(--border, #C9D2EA)" strokeWidth={.8}>
      {[0, 1, 2, 3, 4].map(i => <line key={i} x1={12} x2={338} y1={STAFF_TOP + i * SP} y2={STAFF_TOP + i * SP} />)}
      <line x1={338} x2={338} y1={STAFF_TOP} y2={STAFF_TOP + 4 * SP} />
    </g>
    <Glyph name="gClef" x={18} y={STAFF_TOP + 3 * SP} /><Glyph name="timeSig4" x={55} y={STAFF_TOP + SP} /><Glyph name="timeSig4" x={55} y={STAFF_TOP + 3 * SP} />
    <Score spec={spec} hideMarks={hideMarks || storm} showLinks={showLinks && !storm} />
    {ghost && !storm && <g opacity={.35} color="#A63F35"><Score spec={ghost} marksOnly /></g>}
    {interactive === 'notes' && [0, 1, 2, 3].map(i => <g key={i} className="stage-hit" role="button" tabIndex={0} aria-label={`${ORD[i]} 음에 선택한 표지판 붙이기 또는 떼기`} onClick={() => onNote?.(i)} onKeyDown={event => keyboard(event, () => onNote?.(i))} style={{ cursor: 'pointer', outline: 'none' }}><rect x={X(i)} y={2} width={GEOM.W} height={220} fill="transparent" rx={8} /><title>{ORD[i]} 음</title></g>)}
    {interactive === 'links' && [0, 1, 2].map(i => <g key={i} className="stage-hit" role="button" tabIndex={0} aria-label={`${ORD[i]} 음과 ${ORD[i + 1]} 음 사이 이음줄 ${spec.links[i] ? '떼기' : '붙이기'}`} onClick={() => onLink?.(i)} onKeyDown={event => keyboard(event, () => onLink?.(i))} style={{ cursor: 'pointer', outline: 'none' }}><rect x={(CX(i) + CX(i + 1)) / 2 - 29} y={2} width={58} height={220} fill="transparent" rx={8} /><title>{ORD[i]} 음과 {ORD[i + 1]} 음 잇기</title></g>)}
  </svg>;
});
