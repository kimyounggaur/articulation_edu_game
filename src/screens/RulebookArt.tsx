import { GEOM, plan, printShapes, specOf, type Choice, type Shape } from '../engine/engine';
import { Penguin } from '../art/Penguin';

export type RulebookArtKind = Choice | 'place' | 'link' | 'make' | 'read' | 'det' | 'ear' | 'stars' | 'journey' | 'free';

const labels: Record<RulebookArtKind, string> = {
  none: '보통 걸음의 악보와 발자국', stac: '스타카토의 악보와 짧은 발자국', leg: '레가토 이음줄과 이어진 발자국',
  acc: '악센트 기호와 굵게 시작하는 발자국', ten: '테누토 기호와 길게 유지되는 발자국', marc: '마르카토 기호와 눈이 튀는 강한 발자국',
  place: '표지판을 고른 후 음표를 선택하는 순서', link: '레가토를 고르고 음과 음 사이를 선택하는 순서',
  make: '주문을 읽고 표지판을 붙여 걷는 미션', read: '악보를 보고 걸음을 고르는 미션', det: '발자국을 보고 표지판을 찾는 미션',
  ear: '소리를 듣고 알맞은 표지판을 고르는 미션', stars: '첫 시도 정답 수에 따른 별', journey: '여섯 구간을 순서대로 걸어가는 여정', free: '자유롭게 표지판을 바꾸고 걸어 보는 모습',
};
const kindList: RulebookArtKind[] = ['none', 'stac', 'leg', 'acc', 'ten', 'marc'];

function SnowFrame({children, label}: {children: React.ReactNode; label: string}) {
  return <svg viewBox="0 0 360 155" role="img" aria-label={label} style={{display:'block', width:'100%', height:'auto'}}>
    <title>{label}</title>
    <rect x="1" y="1" width="358" height="153" rx="18" fill="#f2f6fc" stroke="#d3dcf0" />
    <circle cx="25" cy="22" r="2" fill="#c4d4eb"/><circle cx="339" cy="24" r="3" fill="#c4d4eb"/>
    {children}
  </svg>;
}

function PrintShape({shape}: {shape: Shape}) {
  if (shape.k === 'bar') return <rect x={shape.x0} y={118-shape.th/2} width={shape.x1-shape.x0} height={shape.th} rx={shape.th/2}/>;
  if (shape.k === 'wedge') return <polygon points={`${shape.x0},${118-shape.h} ${shape.x1},${118-GEOM.TH/2} ${shape.x1},${118+GEOM.TH/2} ${shape.x0},${118+shape.h}`}/>;
  return <g>{[[5,-21,1.7],[12,-24,1.3],[19,-19.5,1.6],[8,21.5,1.5],[17,23,1.2]].map(([dx,dy,r],i)=><circle key={i} cx={shape.x+dx} cy={118+dy} r={r}/>)}</g>;
}

function ScoreArt({kind}: {kind: Choice}) {
  const spec = specOf(kind === 'none' ? null : [{kind, scope:'ALL'}]);
  const shapes = printShapes(plan(spec));
  return <SnowFrame label={labels[kind]}>
    <rect x="10" y="30" width="340" height="60" rx="10" fill="#fff"/>
    {[0,1,2,3,4].map(i=><line key={i} x1="45" y1={44+i*8} x2="337" y2={44+i*8} stroke="#aebcd4" strokeWidth="1"/>)}
    <text x="18" y="74" fontFamily="serif" fontSize="35" fill="#1b2145">𝄞</text>
    <g fill="#1b2145" stroke="#1b2145">{[0,1,2,3].map(i=><g key={i}>
      <ellipse cx={GEOM.X0+i*GEOM.W} cy="68" rx="6" ry="4.2" transform={`rotate(-18 ${GEOM.X0+i*GEOM.W} 68)`}/>
      <path d={`M${GEOM.X0+i*GEOM.W+5} 68 V46`} fill="none" strokeWidth="1.5"/>
    </g>)}</g>
    <g fill="#df583a" stroke="#df583a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'stac' && [0,1,2,3].map(i=><circle key={i} cx={GEOM.X0+i*GEOM.W} cy="35" r="2.6" stroke="none"/>)}
      {kind === 'ten' && [0,1,2,3].map(i=><line key={i} x1={GEOM.X0+i*GEOM.W-6} y1="35" x2={GEOM.X0+i*GEOM.W+6} y2="35"/>)}
      {kind === 'acc' && [0,1,2,3].map(i=><path key={i} d={`M${GEOM.X0+i*GEOM.W-6} 31 l12 4 -12 4`} fill="none"/>)}
      {kind === 'marc' && [0,1,2,3].map(i=><path key={i} d={`M${GEOM.X0+i*GEOM.W-6} 40 l6 -10 6 10`} fill="none"/>)}
      {kind === 'leg' && <path d={`M${GEOM.X0} 33 Q${GEOM.X0+1.5*GEOM.W} 7 ${GEOM.X0+3*GEOM.W} 33`} fill="none"/>}
    </g>
    <path d="M10 99 Q80 90 145 99 T350 98 V139 Q350 145 342 145 H18 Q10 145 10 137Z" fill="#fff"/>
    {[0,1,2,3,4].map(i=><line key={i} x1={GEOM.X0+i*GEOM.W} x2={GEOM.X0+i*GEOM.W} y1="101" y2="137" stroke="#d5deef" strokeDasharray="2 4"/>)}
    <g fill="#5b6cc4">{shapes.map((shape,i)=><PrintShape key={i} shape={shape}/>)}</g>
    <g transform="translate(46 126) scale(.86)"><Penguin/></g>
  </SnowFrame>;
}

const cell = (x:number, title:string, symbol:React.ReactNode, color='#e8eef9') => <g>
  <rect x={x} y="22" width="92" height="93" rx="15" fill={color} stroke="#d5def0"/>
  <g transform={`translate(${x+46} 66)`}>{symbol}</g>
  <text x={x+46} y="133" textAnchor="middle" fontSize="12" fontWeight="700" fill="#465271">{title}</text>
</g>;
const arrow = (x:number) => <path d={`M${x} 69 h15 m-5 -5 5 5 -5 5`} fill="none" stroke="#a2afc8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>;
const note = <g fill="#1b2145"><ellipse cx="-5" cy="8" rx="8" ry="5" transform="rotate(-18 -5 8)"/><rect x="1" y="-21" width="3" height="30"/></g>;
const foot = <g fill="#5b6cc4"><rect x="-28" y="-3" width="17" height="8" rx="4"/><rect x="-4" y="-3" width="17" height="8" rx="4"/><rect x="20" y="-3" width="12" height="8" rx="4"/></g>;
const walk = <g transform="translate(0 23) scale(1.1)"><Penguin/></g>;
const order = <g><rect x="-24" y="-27" width="48" height="51" rx="6" fill="white" stroke="#93a4c4" strokeWidth="2"/><path d="M-14 -12 h28 M-14 -2 h24 M-14 8 h28" stroke="#9aabc7" strokeWidth="3" strokeLinecap="round"/></g>;
const ear = <g fill="none" stroke="#5b6cc4" strokeWidth="4" strokeLinecap="round"><path d="M-14 -8 C-14 -29 18 -28 18 -7 C18 5 5 6 4 17 C3 27 -9 27 -11 19"/><path d="M-3 -7 C-3 -17 10 -16 10 -7 C10 -1 3 0 3 7"/></g>;
const badge = (txt:string) => <g><circle r="23" fill="#fff" stroke="#c9d4e9" strokeWidth="2"/><text y="8" textAnchor="middle" fontFamily="serif" fontWeight="700" fontSize="28" fill="#e4572e">{txt}</text></g>;

function SequenceArt({kind}: {kind: Exclude<RulebookArtKind, Choice>}) {
  if (kind === 'journey') return <SnowFrame label={labels[kind]}>
    <path d="M38 111 C65 33 100 125 153 69 S233 109 319 42" fill="none" stroke="#c5d2eb" strokeWidth="8" strokeLinecap="round" strokeDasharray="2 13"/>
    {[[42,102],[91,79],[145,74],[198,67],[255,76],[318,43]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="17" fill={i===5?'#e4572e':'#fff'} stroke="#8fa1c3" strokeWidth="2"/><text x={x} y={y+5} textAnchor="middle" fontSize="14" fontWeight="700" fill={i===5?'#fff':'#465271'}>{i+1}</text></g>)}
    <g transform="translate(21 144) scale(.8)"><Penguin/></g>
  </SnowFrame>;
  if (kind === 'stars') return <SnowFrame label={labels[kind]}>
    {['★','★★','★★★'].map((s,i)=><g key={s}><rect x={18+i*109} y="25" width="104" height="80" rx="15" fill="#fff" stroke="#d5def0"/><text x={70+i*109} y="72" textAnchor="middle" fontSize={i===2?26:30} fill="#c87932">{s}</text><text x={70+i*109} y="127" textAnchor="middle" fontSize="12" fill="#465271">{['끝까지 완료','첫 시도 75% 이상','첫 시도 모두 정답'][i]}</text></g>)}
  </SnowFrame>;
  const data: Record<Exclude<RulebookArtKind, Choice | 'journey' | 'stars'>, [string,React.ReactNode,string,React.ReactNode,string,React.ReactNode]> = {
    place:['표지판 선택',badge('·'),'음표 선택',note,'걷기',walk],
    link:['레가토 선택',badge('⌒'),'음 사이 선택',<g key="link"><path d="M-24 5 Q0 -23 24 5" fill="none" stroke="#e4572e" strokeWidth="3" strokeDasharray="4 4"/><circle cx="-24" cy="9" r="5" fill="#1b2145"/><circle cx="24" cy="9" r="5" fill="#1b2145"/></g>,'걷기',walk],
    make:['주문 읽기',order,'표지판 붙이기',badge('·'),'걷기',walk],
    read:['악보 보기',note,'걸음 고르기',badge('톡'),'걷기',walk],
    det:['발자국 보기',foot,'표지판 찾기',badge('?'),'걷기',walk],
    ear:['소리 듣기',ear,'표지판 고르기',badge('?'),'정답 확인',badge('✓')],
    free:['표지판 고르기',badge('>'),'음표에 붙이기',note,'자유롭게 걷기',walk],
  };
  const [a,ai,b,bi,c,ci] = data[kind];
  return <SnowFrame label={labels[kind]}>{cell(12,a,ai)}{arrow(110)}{cell(134,b,bi,'#fff')}{arrow(232)}{cell(256,c,ci)}</SnowFrame>;
}

/** Self-contained, responsive explanations that use the game's actual trace geometry. */
export function RulebookArt({kind}: {kind: RulebookArtKind}) {
  return kindList.includes(kind) ? <ScoreArt kind={kind as Choice}/> : <SequenceArt kind={kind as Exclude<RulebookArtKind, Choice>}/>;
}
