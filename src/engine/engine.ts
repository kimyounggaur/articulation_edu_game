import { PATTERN_DATA } from './pattern-data';

export type Mark = 'none' | 'stac' | 'ten' | 'acc' | 'marc';
export type Kind = 'stac' | 'ten' | 'leg' | 'acc' | 'marc';
export type Pitch = 'B4' | 'C5' | 'D5' | 'E5';
export type Choice = Kind | 'none';
export interface Spec { pitches: Pitch[]; marks: Mark[]; links: boolean[] }
export interface PlanNote { i: number; pitch: Pitch; mark: Mark; linkIn: boolean; linkOut: boolean; len: number; str: 0 | 1 | 2 }
export type Shape = { k: 'bar'; x0: number; x1: number; th: number } | { k: 'wedge'; x0: number; x1: number; h: number } | { k: 'specks'; x: number };
export type Scope = 'ALL' | 'F2' | 'B2' | 'ODD' | 'EVEN' | 'M2' | 'F3' | 'B3' | 'N1' | 'N2' | 'N3' | 'N4';
export interface Clause { kind: Kind; scope: Scope }
export type Pattern = Clause[];
export type Play = 'make' | 'read' | 'det' | 'ear';
export interface Problem { play: Play; form: 'place' | 'choose'; melody: number; target: Spec; pattern: Pattern | null; family: string; orderStyle?: 'mean' | 'name'; choices?: Choice[] }
export interface Diff { i: number; len: 'stac' | 'ten' | 'leg' | 'none' | null; str: 0 | 1 | 2 | null }
export interface MissionResult { firstTry: boolean[] }
export interface Progress { stars: Record<string, 0 | 1 | 2 | 3>; introDone: Record<string, boolean>; stats: Record<Kind, { seen: number; first: number }> }
export interface Voice { start: number; end: number; notes: { time: number; pitch: Pitch; str: 0 | 1 | 2; attack: boolean }[] }
export const GEOM = { X0: 98, W: 58, TH: 10, START_X: 56, LEAD: 0.5 } as const;
export const BEAT = 0.64;
export const KINDS: Kind[] = ['stac', 'ten', 'leg', 'acc', 'marc'];
export const LEARNING_ORDER: Kind[] = ['stac', 'leg', 'acc', 'ten', 'marc'];
export const KIND_INFO: Record<Choice, { name: string; english: string; meaning: string; word: string; glyph: string; description: string; trace: string; sound: string }> = {
  none: { name:'표지판 없음', english:'', meaning:'보통 걸음으로', word:'뚜벅', glyph:'', description:'보통 걸음으로 걸어요.', trace:'자국이 중간 길이이고 음마다 틈이 있어요.', sound:'소리가 중간 길이이고 음 사이가 살짝 비어요.' },
  stac: { name:'스타카토', english:'staccato', meaning:'짧게 끊어서', word:'톡', glyph:'·', description:'스타카토(·)는 음을 짧고 또렷하게 끊어요.', trace:'자국이 한 박보다 훨씬 짧아요. 점처럼 톡 찍혔어요.', sound:'소리가 아주 짧게 끊겨요.' },
  ten: { name:'테누토', english:'tenuto', meaning:'끝까지 꾹 눌러서', word:'꾹', glyph:'–', description:'테누토(–)는 음을 충분한 길이로 끝까지 눌러 유지해요.', trace:'자국이 한 박을 꽉 채웠지만 음마다 끊겨 있어요.', sound:'소리가 길지만 음마다 새로 시작해요.' },
  leg: { name:'레가토', english:'legato', meaning:'끊지 말고 이어서', word:'스르륵', glyph:'⌒', description:'이음줄로 묶은 음은 끊지 않고 부드럽게 이어요. 이것이 레가토예요.', trace:'네 음의 자국이 끊기지 않고 하나로 이어졌어요.', sound:'소리가 끊기지 않고 이어져요.' },
  acc: { name:'악센트', english:'accent', meaning:'세게', word:'쿵', glyph:'>', description:'악센트(>)는 붙은 음 하나를 더 세게 강조해요.', trace:'자국이 굵게 시작해서 가늘어져요. 눈은 튀지 않았어요.', sound:'음이 시작할 때 세게 나요.' },
  marc: { name:'마르카토', english:'marcato', meaning:'가장 세게', word:'쾅', glyph:'^', description:'마르카토(^)는 악센트보다 더 강하고 분명하게 강조해요.', trace:'자국이 가장 굵게 시작하고, 둘레에 눈이 튀었어요.', sound:'음이 시작할 때 가장 세고 또렷해요.' },
};
export const NAME = Object.fromEntries(Object.entries(KIND_INFO).map(([k,v])=>[k,v.name])) as Record<Choice,string>;
export const MEANS = Object.fromEntries(Object.entries(KIND_INFO).map(([k,v])=>[k,v.meaning])) as Record<Choice,string>;
export const WALK_WORD = Object.fromEntries(Object.entries(KIND_INFO).map(([k,v])=>[k,v.word])) as Record<Choice,string>;
export const STAGES: { id: number; name: string; kind: Kind | null; title: string }[] = [
  {id:1,name:'톡톡 길',kind:'stac',title:'1구간 톡톡 길 · 스타카토'},
  {id:2,name:'스르륵 길',kind:'leg',title:'2구간 스르륵 길 · 레가토'},
  {id:3,name:'쿵 길',kind:'acc',title:'3구간 쿵 길 · 악센트'},
  {id:4,name:'꾹꾹 길',kind:'ten',title:'4구간 꾹꾹 길 · 테누토'},
  {id:5,name:'쾅 길',kind:'marc',title:'5구간 쾅 길 · 마르카토'},
  {id:6,name:'눈길 끝까지',kind:null,title:'6구간 눈길 끝까지 · 섞인 길'},
];
export const MELODIES: Pitch[][] = [
  ['C5','D5','E5','C5'],['E5','D5','C5','D5'],['C5','E5','D5','C5'],['D5','C5','B4','C5'],
  ['B4','C5','D5','E5'],['E5','C5','D5','B4'],['C5','D5','C5','B4'],['D5','E5','C5','D5'],
  ['C5','B4','C5','D5'],['E5','D5','E5','C5'],['B4','D5','C5','E5'],['D5','B4','C5','D5'],
];
export const TEXT: Record<string,string> = {
  'T-01':'눈길 발자국',
  'T-14':'악보를 보고 펭귄에게 걸음을 알려 주세요.',
  'T-15':'누가 지나갔을까요? 자국을 보고 표지판을 세워 보세요.',
  'T-16':'자국을 보고 어떤 표지판이 있었는지 골라 보세요.',
  'T-17':'눈보라로 눈길이 안 보여요. 소리를 듣고 골라 보세요.',
  'T-20':'아래에서 표지판을 고른 다음, 붙일 음을 누르세요.',
  'T-22':'이음줄을 골랐어요. 이을 두 음 사이(점선)를 누르세요. 다시 누르면 떼어져요.',
  'T-23':'이음줄 안에서는 점(·)과 줄(–)을 함께 쓰지 않아서 이음줄을 뗐어요.',
  'T-24':'이음줄 안에서는 점(·)과 줄(–)을 함께 쓰지 않아서 그 기호를 뗐어요.',
  'T-25':'먼저 아래에서 표지판을 고르세요.',
  'T-26':'표지판을 모두 뗐어요.', 'T-27':'걸어 볼게요.',
  'T-36':'한 마디 안에서도 음마다 다른 표현을 쓸 수 있어요.',
  'T-43':'정답을 흐리게 보여 줄게요. 그대로 붙이고 걸어 보세요.',
  'T-72':'헷갈린 걸음을 한 번 더 걸어 볼까요?',
  'T-73':'이 화면에서는 소리를 낼 수 없어요. 걸음과 자국으로 확인해 주세요.',
  'T-74':'소리를 켜야 할 수 있어요.', 'T-75':'앞의 미션을 마치면 열려요.',
  'T-76':'별과 기록을 모두 지울까요? 되돌릴 수 없어요.',
};
export const SCOPES: Record<Scope, number[]> = {ALL:[0,1,2,3],F2:[0,1],B2:[2,3],ODD:[0,2],EVEN:[1,3],M2:[1,2],F3:[0,1,2],B3:[1,2,3],N1:[0],N2:[1],N3:[2],N4:[3]};
export const SCOPE_NAMES: Record<Scope,string> = {ALL:'네 음 모두',F2:'앞의 두 음',B2:'뒤의 두 음',ODD:'첫째 음과 셋째 음',EVEN:'둘째 음과 넷째 음',M2:'가운데 두 음',F3:'앞의 세 음',B3:'뒤의 세 음',N1:'첫째 음',N2:'둘째 음',N3:'셋째 음',N4:'넷째 음'};
const ORD = ['첫째','둘째','셋째','넷째'];
const cloneSpec = (s:Spec): Spec => ({pitches:[...s.pitches],marks:[...s.marks],links:[...s.links]});
export const emptySpec = (melody=0): Spec => ({pitches:[...MELODIES[((melody%12)+12)%12]],marks:['none','none','none','none'],links:[false,false,false]});
export const emptyProgress = (): Progress => ({stars:{},introDone:{},stats:Object.fromEntries(KINDS.map(k=>[k,{seen:0,first:0}])) as Progress['stats']});

export function plan(spec: Spec): PlanNote[] {
  return spec.marks.map((mark,i)=>({i,pitch:spec.pitches[i],mark,linkIn:i>0&&!!spec.links[i-1],linkOut:i<3&&!!spec.links[i],len:spec.links[i]?1:mark==='stac'?.3:mark==='ten'?.92:.65,str:mark==='acc'?1:mark==='marc'?2:0}));
}
export function printShapes(notes: PlanNote[]): Shape[] {
  const out:Shape[]=[];
  for(let i=0;i<notes.length;) {
    let b=i; while(b<notes.length-1&&notes[b].linkOut)b++;
    out.push({k:'bar',x0:GEOM.X0+i*GEOM.W,x1:GEOM.X0+(b+notes[b].len)*GEOM.W,th:b===i&&notes[i].mark==='stac'?12:GEOM.TH});
    for(let j=i;j<=b;j++) if(notes[j].str>0) {
      const x0=GEOM.X0+j*GEOM.W;
      out.push({k:'wedge',x0,x1:x0+Math.min(.65*GEOM.W,j===b?notes[j].len*GEOM.W:GEOM.W),h:notes[j].str===1?11:17});
      if(notes[j].str===2)out.push({k:'specks',x:x0});
    }
    i=b+1;
  }
  return out;
}
export function isValid(s:Spec):boolean {
  if(s.pitches.length!==4||s.marks.length!==4||s.links.length!==3)return false;
  if(s.pitches.some(p=>!['B4','C5','D5','E5'].includes(p))||s.marks.some(m=>!['none','stac','ten','acc','marc'].includes(m)))return false;
  return s.links.every((link,j)=>typeof link==='boolean'&&(!link||![s.marks[j],s.marks[j+1]].some(m=>m==='stac'||m==='ten')));
}
export function applyMark(state:Spec,i:number,mark:Mark):{spec:Spec;notice?:'T-23'} {
  const spec=cloneSpec(state); if(i<0||i>3)return {spec};
  spec.marks[i]=spec.marks[i]===mark?'none':mark;
  let cut=false;
  if(spec.marks[i]==='stac'||spec.marks[i]==='ten') for(const j of [i-1,i]) if(j>=0&&j<3&&spec.links[j]){spec.links[j]=false;cut=true;}
  return {spec,...(cut?{notice:'T-23' as const}:{})};
}
export function toggleLink(state:Spec,j:number):{spec:Spec;notice?:'T-24'} {
  const spec=cloneSpec(state); if(j<0||j>2)return {spec};
  spec.links[j]=!spec.links[j];let cut=false;
  if(spec.links[j])for(const i of [j,j+1])if(spec.marks[i]==='stac'||spec.marks[i]==='ten'){spec.marks[i]='none';cut=true;}
  return {spec,...(cut?{notice:'T-24' as const}:{})};
}
const lenCat=(n:PlanNote): NonNullable<Diff['len']> => n.linkOut?'leg':n.mark==='stac'||n.mark==='ten'?n.mark:'none';
export function judge(player:Spec,target:Spec):Diff[] {
  const a=plan(player),b=plan(target);
  return a.map((n,i):Diff=>({i,len:lenCat(n)!==lenCat(b[i])?lenCat(b[i]):null,str:n.str!==b[i].str?b[i].str:null})).filter(d=>d.len!==null||d.str!==null);
}
export function hintText(diffs:Diff[],level:number,play:Play):string {
  if(!diffs.length)return '딱 맞아요!';
  if(level>=3)return TEXT['T-43'];
  const d=diffs[0],who=ORD[d.i]+' 음',prefix=diffs.length>1?`${diffs.length}곳이 달라요. 먼저 `:'';
  if(level<=1)return prefix+who+'의 '+(d.len!==null&&d.str!==null?'길이와 세기':d.len!==null?'길이':'세기')+'가 '+({make:'주문과',read:'악보와',det:'자국과',ear:'소리와'}[play])+' 달라요.';
  const read=play==='read';const parts:string[]=[];
  if(d.len!==null)parts.push((read?{stac:'점(·)이 있어요. 짧게 끊는 걸음(톡)이에요',ten:'줄(–)이 있어요. 끝까지 누르는 걸음(꾹)이에요',leg:'다음 음까지 이음줄이 걸쳐 있어요. 이어 가는 걸음(스르륵)이에요',none:'길이를 바꾸는 기호가 없어요. 보통 걸음이에요'}:{stac:'짧게 끊어야 해요(스타카토 ·)',ten:'한 박을 끝까지 채워야 해요(테누토 –)',leg:'다음 음까지 이어야 해요(이음줄)',none:'보통 길이여야 해요(점·줄·이음줄 없이)'})[d.len]);
  if(d.str!==null)parts.push((read?['세기를 바꾸는 기호가 없어요. 보통 세기예요','>가 있어요. 세게 딛는 걸음(쿵)이에요','^가 있어요. 가장 세게 딛는 걸음(쾅)이에요']:['보통 세기여야 해요(> ^ 없이)','세게 디뎌야 해요(악센트 >)','가장 세게 디뎌야 해요(마르카토 ^)'])[d.str]);
  return prefix+who+': '+parts.join(', ')+'.';
}
export function patterns(stage:number):Pattern[] {
  const data=PATTERN_DATA.filter(r=>r.stage===stage||(stage===6&&r.stage>=2&&r.stage<=5&&r.pattern.length===2));
  return data.map(r=>r.pattern.map(c=>({...c})));
}
export function specOf(pattern:Pattern|null,melody=0):Spec {
  const spec=emptySpec(melody);
  for(const clause of pattern??[]) {
    const ids=SCOPES[clause.scope];
    if(clause.kind==='leg')for(let j=0;j<ids.length-1;j++)spec.links[ids[j]]=true;
    else for(const i of ids)spec.marks[i]=clause.kind;
  }
  return spec;
}
export function orderText(pattern:Pattern|null,style:'mean'|'name'='mean'):string {
  if(!pattern?.length)return '네 음 모두 보통 걸음으로 건너 줘.';
  const clauses=[...pattern].sort((a,b)=>SCOPES[a.scope][0]-SCOPES[b.scope][0]);
  const names:Record<Kind,string>={stac:'스타카토로',ten:'테누토로',leg:'레가토로',acc:'악센트를 붙여서',marc:'마르카토로'};
  const parts=clauses.map(c=>SCOPE_NAMES[c.scope]+(c.scope==='ALL'?' ':'은 ')+(style==='name'?names[c.kind]:KIND_INFO[c.kind].meaning));
  if(new Set(clauses.flatMap(c=>SCOPES[c.scope])).size<4)parts.push('나머지는 보통 걸음으로');
  return parts.join(', ')+' 건너 줘.';
}
export function rng(seed:number):()=>number {
  let a=seed>>>0;
  return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
const shuffle=<T>(items:readonly T[],random:()=>number):T[]=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const keyOf=(p:Pattern|null)=>JSON.stringify(p?[...p].sort((a,b)=>SCOPES[a.scope][0]-SCOPES[b.scope][0]):null);
export function familyOf(p:Pattern):string {
  if(p.length===1)return '한 가지';
  if(p.length===3)return '세 가지';
  const entry=PATTERN_DATA.find(row=>keyOf(row.pattern.map(c=>({...c})))===keyOf(p));
  return entry?.family??[...new Set(p.map(c=>c.kind))].sort().join('+');
}
export const kindsOf=(s:Spec):Kind[]=>KINDS.filter(k=>k==='leg'?s.links.some(Boolean):s.marks.includes(k));
export function makeMission(missionId:string,seed:number):Problem[] {
  const [stage,mission]=missionId.split('-').map(Number);
  if(!(stage>=1&&stage<=6)||!(mission>=1&&mission<=4)||(mission===4&&stage!==6))return [];
  const random=rng(seed);
  const play:Play=mission===1?'make':mission===2?'read':mission===3?'det':'ear';
  if(play==='ear') {
    const melodies=shuffle(Array.from({length:12},(_,i)=>i),random);
    return shuffle<Choice>(['none',...KINDS],random).map((kind,i)=>choiceProblem(kind,play,melodies[i],['none',...KINDS]));
  }
  for(let attempt=0;attempt<100;attempt++) {
    const melodies=shuffle(Array.from({length:12},(_,i)=>i),random);
    const pool=patterns(stage),used=new Set<string>(),selected:Pattern[]=[];
    const take=(count:number,predicate:(p:Pattern)=>boolean)=>{
      const options=shuffle(pool.filter(p=>!used.has(keyOf(p))&&predicate(p)),random);
      for(const p of options.slice(0,count)){selected.push(p);used.add(keyOf(p));}
    };
    const pair=(kind:Kind)=>(p:Pattern)=>p.length===2&&p.some(c=>c.kind===kind);
    const det=play==='det'&&stage>=3;
    if(stage===1) {
      take(1,p=>p[0].scope==='ALL');take(1,p=>SCOPES[p[0].scope].length===1);take(1,p=>SCOPES[p[0].scope].length===2);take(2,()=>true);
    } else if(stage===2) {
      take(1,p=>p.length===1&&p[0].scope==='ALL');take(1,p=>p.length===1);take(3,p=>p.length===2);
    } else if(stage===3) {
      if(!det)take(2,p=>p.length===1);take(1,pair('stac'));take(1,pair('leg'));take(1,p=>p.length===2);
    } else if(stage===4) {
      if(!det)take(2,p=>p.length===1);take(1,pair('stac'));take(1,pair('leg'));take(1,pair('acc'));
    } else if(stage===5) {
      if(!det)take(1,p=>p.length===1);take(2,pair('acc'));
      const rest=shuffle<Kind>(['stac','ten','leg'],random);
      for(const k of rest.slice(0,det?1:2))take(1,pair(k));
    } else {take(det?2:4,p=>p.length===2);take(det?3:4,p=>p.length===3);}
    let choices:Choice[]=[];
    if(det) {
      if(stage===3)choices=['acc',shuffle<Choice>(['none','stac','leg'],random)[0]];
      if(stage===4)choices=['ten',shuffle<Choice>(['none','leg'],random)[0]];
      if(stage===5)choices=['marc','acc'];
      if(stage===6) {
        choices=[shuffle<Choice>(['stac','ten','leg'],random)[0],shuffle<Choice>(['acc','marc'],random)[0]];
        const allChoices:Choice[]=['none',...KINDS];
        choices.push(shuffle<Choice>(allChoices.filter(k=>!choices.includes(k)),random)[0]);
      }
      choices=shuffle(choices,random);
    }
    const choiceList:Choice[]=['none',...LEARNING_ORDER.slice(0,Math.min(stage,5))];
    const problems:Problem[]=choices.map((k,i)=>choiceProblem(k,play,melodies[i],choiceList));
    const ordered=stage===1?selected:shuffle(selected,random);
    ordered.forEach((p,i)=>problems.push({play,form:'place',melody:melodies[choices.length+i],target:specOf(p,melodies[choices.length+i]),pattern:p,family:familyOf(p),...(play==='make'?{orderStyle:i<(stage===6?4:3)?'mean' as const:'name' as const}:{})}));
    if(stage!==6||new Set(problems.flatMap(p=>kindsOf(p.target))).size===5)return problems;
  }
  throw new Error('Unable to generate a mission satisfying coverage');
}
function choiceProblem(kind:Choice,play:Play,melody:number,choices:Choice[]):Problem {
  const pattern:Pattern|null=kind==='none'?null:[{kind,scope:'ALL'}];
  return {play,form:'choose',melody,target:specOf(pattern,melody),pattern,family:'고르기:'+kind,choices:[...choices]};
}
export function makeRetry(missionId:string,problems:Problem[],firstTry:boolean[],seed:number):Problem[] {
  const stage=Number(missionId.split('-')[0]),random=rng(seed),used=new Set(problems.map(p=>keyOf(p.pattern))),out:Problem[]=[];
  for(let i=0;i<problems.length&&out.length<2;i++)if(firstTry[i]===false) {
    const original=problems[i];let melody=Math.floor(random()*12);if(melody===original.melody)melody=(melody+1)%12;
    if(original.form==='choose'){out.push({...original,melody,target:specOf(original.pattern,melody)});continue;}
    const remaining=patterns(stage).filter(p=>!used.has(keyOf(p)));
    const same=remaining.filter(p=>familyOf(p)===original.family);
    const pick=shuffle(same.length?same:remaining,random)[0];
    if(pick){used.add(keyOf(pick));out.push({...original,melody,target:specOf(pick,melody),pattern:pick,family:familyOf(pick)});}
  }
  return out;
}
export function starsOf(result:MissionResult):1|2|3 {
  const total=result.firstTry.length,correct=result.firstTry.filter(Boolean).length;
  return total>0&&correct===total?3:total>0&&correct/total>=.75?2:1;
}
export function applyResult(progress:Progress,missionId:string,problems:Problem[],result:MissionResult):Progress {
  const next:Progress={stars:{...progress.stars},introDone:{...progress.introDone},stats:Object.fromEntries(KINDS.map(k=>[k,{...progress.stats[k]}])) as Progress['stats']};
  next.stars[missionId]=Math.max(next.stars[missionId]??0,starsOf(result)) as 1|2|3;
  problems.forEach((p,i)=>{for(const k of kindsOf(p.target)){next.stats[k].seen++;if(result.firstTry[i])next.stats[k].first++;}});
  return next;
}
export function isOpen(progress:Progress,missionId:string,classOpen=0,soundOn=true):boolean {
  const [stage,mission]=missionId.split('-').map(Number);
  if(!Number.isInteger(stage)||!Number.isInteger(mission)||stage<1||stage>6||mission<0||mission>4||(mission===4&&stage!==6))return false;
  if(mission===4)return soundOn&&(classOpen>=6||[1,2,3].every(m=>(progress.stars['6-'+m]??0)>=1));
  if(classOpen>=stage)return true;
  const stageOpen=stage===1||[1,2,3].every(m=>(progress.stars[(stage-1)+'-'+m]??0)>=1);
  if(!stageOpen)return false;
  if(mission===0)return true;
  if(mission===1)return !!progress.introDone[stage+'-0'];
  return (progress.stars[stage+'-'+(mission-1)]??0)>=1;
}
export function openKinds(progress:Progress,classOpen=0):Kind[] {
  let max=1;for(let stage=1;stage<=6;stage++)if(isOpen(progress,stage+'-0',classOpen,true))max=stage;
  return LEARNING_ORDER.slice(0,Math.min(5,max));
}
export function audioPlan(notes:PlanNote[],beat=BEAT):Voice[] {
  const out:Voice[]=[];
  for(let i=0;i<notes.length;) {
    let b=i;while(b<notes.length-1&&notes[b].linkOut)b++;
    out.push({start:i*beat,end:(b+notes[b].len)*beat,notes:notes.slice(i,b+1).map((n,j)=>({time:n.i*beat,pitch:n.pitch,str:n.str,attack:j===0}))});
    i=b+1;
  }
  return out;
}
export function poseAt(notes:PlanNote[],t:number,beat=BEAT):{x:number;lift:number;slide:number;sx:number;sy:number} {
  if(t<0){const u=Math.max(0,1+t/GEOM.LEAD);return {x:GEOM.START_X+(GEOM.X0-GEOM.START_X)*u,lift:48*u*(1-u),slide:0,sx:1,sy:1};}
  if(t>=4*beat)return {x:GEOM.X0+4*GEOM.W,lift:0,slide:0,sx:1,sy:1};
  const i=Math.floor(t/beat),u=t/beat-i,n=notes[i],x=GEOM.X0+(i+u)*GEOM.W;
  if(u<=n.len){const k=Math.min(1,u*beat/.14),hit=n.linkIn&&n.str===0?0:[.1,.24,.36][n.str]*(1-k),hold=n.mark==='ten'?.1:0;return {x,lift:0,slide:n.linkOut||n.linkIn?1:0,sx:1+(hit+hold)*.6,sy:1-hit-hold};}
  const v=(u-n.len)/(1-n.len);return {x,lift:Math.min(20,28*(1-n.len))*4*v*(1-v),slide:0,sx:.97,sy:1.05};
}
export function onoOf(n:PlanNote):{text:string;size:0|1|2}|null {
  if(n.str===2)return {text:'쾅',size:2};if(n.str===1)return {text:'쿵',size:1};
  if(n.linkOut&&!n.linkIn)return {text:'스르륵',size:0};if(n.linkIn)return null;
  return n.mark==='stac'?{text:'톡',size:0}:n.mark==='ten'?{text:'꾹',size:0}:null;
}
export function successText(spec:Spec):string {const kinds=kindsOf(spec);return '딱 맞아요! '+(kinds.length===1?KIND_INFO[kinds[0]].description:TEXT['T-36']);}
export function choiceText(kind:Choice,correct:boolean,revealed:boolean,play:Play,chosen?:Choice):string {
  const info=KIND_INFO[kind],hint=play==='ear'?info.sound:info.trace;
  if(revealed)return `정답은 ${info.name}${kind==='none'?'이에요':'예요'}. ${hint}`;
  if(correct)return `맞아요! ${info.name}. ${info.description}`;
  return `${KIND_INFO[chosen??'none'].name}${chosen==='none'?'은':'는'} 아니에요. ${hint}`;
}
export function selectedText(kind:Choice,play:Play|'free'='free'):string {
  if(kind==='leg')return TEXT['T-22'];
  if(play==='read')return `${KIND_INFO[kind].word}(${KIND_INFO[kind].meaning}) 걸음을 골랐어요. 그렇게 걸을 음을 누르세요.`;
  return `${KIND_INFO[kind].name}${kind==='none'?'을':'를'} 골랐어요. 붙일 음을 누르세요. 다시 누르면 떼어져요.`;
}
export function resultText(result:MissionResult):string {return `${result.firstTry.length}문제 가운데 ${result.firstTry.filter(Boolean).length}문제를 한 번에 맞혔어요.`;}
export function starText(stars:number):string {return ['','끝까지 걸었어요.','거의 한 번에 걸었어요.','모두 한 번에 걸었어요!'][stars]??'';}
export const MISSIONS = STAGES.flatMap(s=>[0,1,2,3].map(m=>`${s.id}-${m}`)).concat('6-4');
export const symbolKinds = kindsOf;
export const correctText = successText;
export function completeIntro(progress:Progress,stage:number):Progress {
  if(!Number.isInteger(stage)||stage<1||stage>6)return progress;
  return {...progress,introDone:{...progress.introDone,[`${stage}-0`]:true}};
}
export function chooseFeedback(play:Play,target:Spec,choice:Choice,wrongCount:number):{correct:boolean;revealed:boolean;text:string} {
  const correct=judge(specOf(choice==='none'?null:[{kind:choice,scope:'ALL'}]),target).length===0;
  const kind:Choice=kindsOf(target)[0]??'none',revealed=!correct&&wrongCount>=2;
  return {correct,revealed,text:choiceText(kind,correct,revealed,play,choice)};
}
export function readCards(spec:Spec):string[] {
  return plan(spec).map(n=>n.str===2?'쾅':n.str===1?'쿵':n.linkIn||n.linkOut?'스르륵':n.mark==='stac'?'톡':n.mark==='ten'?'꾹':'뚜벅');
}
export function nextMissionId(id:string):string|null {
  const [stage,mission]=id.split('-').map(Number);
  if(stage<1||stage>6||mission<0||mission>4)return null;
  if(mission<3)return `${stage}-${mission+1}`;
  return stage<6?`${stage+1}-0`:null;
}

export interface IntroScene { text:string; show:Pattern|null; interaction?:'place'|'compare'|'table'; finish?:boolean }
export const INTRO:Record<number,IntroScene[]> = {
  1:[
    {text:'표지판이 없으면 펭귄은 보통 걸음으로 걸어요. 「걷기」를 눌러 보세요.',show:null},
    {text:'음표 위에 점(·)이 붙으면 스타카토(staccato)예요. 음을 짧고 또렷하게 끊어요. 발끝으로 톡!',show:[{kind:'stac',scope:'ALL'}]},
    {text:'직접 붙여 보세요. 스타카토를 고르고 음을 누른 다음 「걷기」.',show:null,interaction:'place'},
    {text:'점이 붙은 음만 짧아져요. 자국도 점처럼 짧아요.',show:null,finish:true},
  ],
  2:[
    {text:'이음줄(⌒)은 음과 음 사이에 걸쳐요. 이어진 음은 끊지 않고 부드럽게 연주해요. 이것이 레가토(legato)예요. 스르륵!',show:[{kind:'leg',scope:'ALL'}]},
    {text:'직접 이어 보세요. 레가토를 고르고 두 음 사이의 점선을 누른 다음 「걷기」.',show:null,interaction:'place'},
    {text:'이음줄 안에서는 발을 떼지 않아서 자국이 끊기지 않아요.',show:null,finish:true},
  ],
  3:[
    {text:'>는 악센트(accent)예요. 붙은 음 하나를 더 세게 강조해요. 쿵!',show:[{kind:'acc',scope:'N3'}]},
    {text:'악센트를 다른 음에 붙여 보세요.',show:null,interaction:'place'},
    {text:'세게 디딘 자국은 굵게 시작해서 가늘어져요. 길이는 보통 걸음과 같아요.',show:null,finish:true},
  ],
  4:[
    {text:'가로줄(–)은 테누토(tenuto)예요. 음을 충분한 길이로 끝까지 눌러 유지해요. 꾹!',show:[{kind:'ten',scope:'ALL'}]},
    {text:'보통 걸음, 테누토, 레가토를 차례로 눌러 견주어 보세요.',show:null,interaction:'compare'},
    {text:'테누토는 한 박을 꽉 채우지만 음마다 새로 디뎌요. 레가토는 발을 떼지 않고 이어 가요.',show:null,finish:true},
  ],
  5:[
    {text:'^는 마르카토(marcato)예요. 악센트보다 더 강하고 분명하게 강조해요. 쾅!',show:[{kind:'marc',scope:'N1'},{kind:'acc',scope:'N3'}]},
    {text:'마르카토를 직접 붙여 보세요.',show:null,interaction:'place'},
    {text:'쾅 자국은 쿵 자국보다 더 굵고, 둘레에 눈이 튀어요.',show:null,finish:true},
  ],
  6:[
    {text:'표지판은 두 가지를 알려 줘요. 얼마나 길게 이어서 걷는지(톡, 꾹, 스르륵), 얼마나 세게 딛는지(쿵, 쾅).',show:null,interaction:'table'},
    {text:'한 마디 안에서 음마다 다른 표지판을 쓸 수 있어요.',show:[{kind:'leg',scope:'F2'},{kind:'stac',scope:'N3'},{kind:'marc',scope:'N4'}]},
    {text:'이제 눈길 끝까지 가 볼까요?',show:null,finish:true},
  ],
};
