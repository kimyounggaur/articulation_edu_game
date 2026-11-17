'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { applyMark, toggleLink, specOf, judge, hintText, orderText, makeMission, makeRetry, starsOf, isOpen, openKinds, emptyProgress, KIND_INFO, STAGES, MISSIONS, KINDS, correctText, chooseFeedback, symbolKinds, readCards, selectedText, type Kind, type Spec, type Problem, type Diff } from '../engine/engine';
import { Stage, type StageHandle } from '../stage/Stage';
import { useGame } from '../store/game';
import { useNavigation, type Route } from '../store/navigation';
import { LABELS as L, MISSION_LABELS } from './labels';
import { INTRO_SCENES } from './introScenes';
import Settings from './Settings';
import Records from './Records';
import Rulebook from './Rulebook';

type Tool=Kind|'clear'|null;
const seedOf=()=>crypto.getRandomValues(new Uint32Array(1))[0];
const missionName=(id:string)=>MISSION_LABELS[Number(id.split('-')[1])];
const stageName=(n:number)=>STAGES.find(s=>s.id===n)?.name??'';
const noticeText=(id?:string)=>id==='T-23'?'이음줄 안에서는 점(·)과 줄(–)을 함께 쓰지 않아서 이음줄을 뗐어요.':id==='T-24'?'이음줄 안에서는 점(·)과 줄(–)을 함께 쓰지 않아서 그 기호를 뗐어요.':'';
const getSound=()=>{const s=useGame.getState();return s.soundOverride??s.settings.soundOn;};

export function SnowpathApp(){
 const {route,setRoute}=useNavigation();
 const {hydrated,hydrate,settings,soundOverride,setSound}=useGame();
 const [toast,setToast]=useState('');
 const [rulebookOpen,setRulebookOpen]=useState(false);
 const [leave,setLeave]=useState<Route|null>(null);
 const sound=soundOverride??settings.soundOn;
 const go=useCallback((next:Route,force=false)=>{
   if(!force&&route.screen==='mission'){setLeave(next);return;}
   history.pushState({snowpath:next},'',location.href);setRoute(next);window.scrollTo(0,0);
 },[route.screen,setRoute]);
 useEffect(()=>{hydrate();history.replaceState({snowpath:{screen:'home'}},'',location.href);
   const pop=(e:PopStateEvent)=>{
    const next=e.state?.snowpath??{screen:'home'};
    if(useNavigation.getState().route.screen==='mission'&&!window.confirm(L.leaveMission)){
      history.pushState({snowpath:useNavigation.getState().route},'',location.href);return;
    }
    setRoute(next);window.scrollTo(0,0);
   };window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);
 },[hydrate,setRoute]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),4000);return()=>clearTimeout(t);},[toast]);
 const start=(id:string)=>id.endsWith('-0')?go({screen:'intro',stage:Number(id[0])}):go({screen:'mission',id,seed:seedOf()});
 const title=route.screen==='home'?'눈길 발자국':route.screen==='mission'?`${route.id[0]}구간 · ${missionName(route.id)}`:route.screen==='intro'?`${route.stage}구간 · ${L.intro}`:L[route.screen];
 if(!hydrated)return <main className="loading"><SnowIcon/><h1>눈길 발자국</h1><p>눈길을 준비하고 있어요…</p></main>;
 return <div className={`app ${route.screen==='home'?'home-app':''}`}>
  <header className="topbar">
   {route.screen==='home'?<a className="brand" href="#main" aria-label="눈길 발자국"><SnowIcon small/><span>눈길 발자국</span></a>:<button className="icon-button" onClick={()=>go({screen:'home'})} aria-label={L.back}>←</button>}
   {route.screen!=='home'&&<h1>{title}</h1>}
   <div className="header-actions">
    <button className="rulebook-trigger" type="button" aria-label="게임 룰북 열기" aria-haspopup="dialog" onClick={()=>setRulebookOpen(true)}><span aria-hidden="true">▤</span><span>룰북</span></button>
    {route.screen==='home'&&<><button className="header-text" onClick={()=>go({screen:'records'})}>{L.records}</button><button className="icon-button" aria-label={L.settings} onClick={()=>go({screen:'settings'})}>⚙</button></>}
    <button className="sound-button" aria-label={sound?L.soundOn:L.soundOff} aria-pressed={sound} onClick={()=>setSound(!sound)}><span aria-hidden="true">{sound?'♪':'♩'}</span><span>{sound?'소리 켬':'소리 끔'}</span></button>
   </div>
  </header>
  <main id="main">
   {route.screen==='home'&&<Home start={start} onFree={()=>go({screen:'free'})} notice={setToast}/>}
   {route.screen==='free'&&<FreePlay sound={sound} notice={setToast}/>}
   {route.screen==='intro'&&<Intro key={route.stage} stage={route.stage} sound={sound} onFinish={()=>go({screen:'home'},true)} notice={setToast}/>}
   {route.screen==='mission'&&<Mission key={`${route.id}-${route.seed}`} id={route.id} seed={route.seed} sound={sound} notice={setToast} onHome={()=>go({screen:'home'},true)} onRetry={()=>go({screen:'mission',id:route.id,seed:seedOf()},true)} onNext={(id)=>id.endsWith('-0')?go({screen:'intro',stage:Number(id[0])},true):go({screen:'mission',id,seed:seedOf()},true)}/>}
   {route.screen==='records'&&<Records onHome={()=>go({screen:'home'})}/>}
   {route.screen==='settings'&&<Settings onHome={()=>go({screen:'home'})}/>}
  </main>
  <Rulebook open={rulebookOpen} onClose={()=>setRulebookOpen(false)}/>
  {toast&&<div className="toast" role="status">{toast}</div>}
  {leave&&<div className="modal-scrim"><section className="panel confirm-panel" role="alertdialog" aria-modal="true" aria-labelledby="leave-title"><h2 id="leave-title">{L.leaveMission}</h2><div className="actions"><button className="button secondary" onClick={()=>setLeave(null)}>계속 걷기</button><button className="button" onClick={()=>{go(leave,true);setLeave(null);}}>지도로 돌아가기</button></div></section></div>}
 </div>;
}

function SnowIcon({small=false}:{small?:boolean}){return <svg width={small?30:64} height={small?30:64} viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6v52M9 19l46 26M9 45l46-26M25 11l7 7 7-7M25 53l7-7 7 7M10 28l10-3-2-10M54 36l-10 3 2 10M10 36l10 3-2 10M54 28l-10-3 2-10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;}

function TrailArt({stage=1,hero=false}:{stage?:number;hero?:boolean}){
 const symbols=['·','⌒','>','–','^','♪'];
 return <svg className={hero?'hero-art':'trail-art'} viewBox="0 0 300 160" aria-hidden="true">
  <path d="M0 112Q43 67 96 100T202 93T300 104V160H0Z" fill="#dce5f6"/><path d="M0 133Q69 94 135 128T300 114V160H0Z" fill="#fff"/>
  <path d="M32 147Q51 98 118 113T247 84" fill="none" stroke="#c9d2ea" strokeWidth="16" strokeLinecap="round"/>
  {[0,1,2,3,4].map(i=><ellipse key={i} cx={58+i*39} cy={125-Math.sin(i)*13-i*5} rx={stage===1?4:stage===4?15:10} ry={stage===5?5:3} fill="#5b6cc4" transform={`rotate(-12 ${58+i*39} ${125-Math.sin(i)*13-i*5})`}/>)}
  <path d="M242 91V30" stroke="#aeb9d7" strokeWidth="4"/><rect x="223" y="19" width="39" height="33" rx="10" fill={hero?'#e4572e':'#fff'} stroke={hero?'#e4572e':'#c9d2ea'} strokeWidth="2"/><text x="242" y="43" textAnchor="middle" fontSize="30" fill={hero?'#fff':'#1b2145'}>{symbols[stage-1]}</text>
  <g transform="translate(96 79) rotate(-7)"><ellipse cx="0" cy="23" rx="21" ry="27" fill="#1b2145"/><ellipse cx="2" cy="30" rx="14" ry="18" fill="#fff"/><ellipse cx="3" cy="5" rx="18" ry="19" fill="#1b2145"/><path d="M-8 7Q0-8 8 6Q17-7 19 8Q18 22 6 23Q-8 21-8 7" fill="#fff"/><circle cx="1" cy="7" r="2" fill="#1b2145"/><circle cx="12" cy="7" r="2" fill="#1b2145"/><path d="M4 12l10 1-5 5Z" fill="#eaa64b"/><path d="M-15 21Q0 29 19 18l1 7Q0 36-17 28Z" fill="#e4572e"/><path d="M-12 47l-7 5h14M9 47l-3 5h14" fill="#eaa64b" stroke="#eaa64b" strokeWidth="3" strokeLinecap="round"/></g>
  {hero&&<><circle cx="34" cy="36" r="3" fill="#fff"/><circle cx="163" cy="27" r="2" fill="#fff"/><path d="M178 64v10m-5-5h10" stroke="#a8b8da" strokeWidth="2"/></>}
 </svg>;
}

function Home({start,onFree,notice}:{start:(id:string)=>void;onFree:()=>void;notice:(text:string)=>void}){
 const {progress,classOpen,settings,soundOverride}=useGame();const sound=soundOverride??settings.soundOn;
 const total=Object.entries(progress.stars).filter(([id])=>id!=='6-4').reduce((n,[,s])=>n+s,0);
 const current=MISSIONS.find(id=>isOpen(progress,id,classOpen,sound)&&(id.endsWith('-0')?!progress.introDone[id]:!progress.stars[id]));
 return <div className="home-content">
  <section className="hero"><div className="hero-copy"><span className="eyebrow">펭귄과 함께 배우는 음악 표현</span><h1>같은 음표,<br/><em>다른 발자국.</em></h1><p>표지판을 읽고 눈길을 걸어요.<br/>작은 걸음이 음악이 되는 곳.</p><button className="button" onClick={()=>current?start(current):onFree()}>{total===0&&!Object.values(progress.introDone).some(Boolean)?'첫 눈길 시작하기':'이어서 걷기'} <span aria-hidden="true">→</span></button></div><TrailArt stage={1} hero/><div className="hero-caption">톡 · 꾹 · 스르륵 · 쿵 · 쾅</div></section>
  <div className="map-heading"><div><span className="eyebrow">여섯 번의 작은 모험</span><h2>나의 눈길 지도</h2></div><div className="star-counter" aria-label={`모은 별 ${total}개, 전체 54개`}><span>★</span> {total}<small> / 54</small></div></div>
  {classOpen>0&&<p className="class-banner">수업용 링크로 {classOpen}구간까지 열려 있어요. 기록은 그대로예요.</p>}
  <div className="map-grid">{STAGES.map(stage=>{
   const ids=MISSIONS.filter(id=>Number(id[0])===stage.id);const available=ids.some(id=>isOpen(progress,id,classOpen,sound));const active=!!current&&Number(current[0])===stage.id;
   return <section className={`map-card ${active?'current':''} ${!available?'locked-card':''}`} key={stage.id}>
    <div className="map-card-top"><div><span className="stage-number">{String(stage.id).padStart(2,'0')} <span>구간</span></span><h3>{stage.name}</h3><p>{stage.kind?KIND_INFO[stage.kind].name:'다섯 표지판 섞어 걷기'}</p></div><TrailArt stage={stage.id}/>{active&&<span className="current-tag">지금 걸을 길</span>}</div>
    <div className="mission-list">{ids.map(id=>{const open=isOpen(progress,id,classOpen,sound);const intro=id.endsWith('-0');const done=intro?!!progress.introDone[id]:!!progress.stars[id];return <button className={`mission-button ${current===id?'active':''}`} key={id} aria-disabled={!open} aria-label={`${missionName(id)}${!open?' 잠김':''}`} onClick={()=>open?start(id):notice(id==='6-4'&&isOpen(progress,id,classOpen,true)?'소리를 켜야 할 수 있어요.':L.locked)}><span className="mission-icon" aria-hidden="true">{!open?'⌑':done?'✓':intro?'◉':'○'}</span><span>{missionName(id)}{id==='6-4'&&<small> 선택</small>}</span><span className={`mission-stars ${done?'earned':''}`}>{intro?(done?'완료':'배우기'):'★'.repeat(progress.stars[id]??0)+'☆'.repeat(3-(progress.stars[id]??0))}</span><span className="mission-arrow" aria-hidden="true">›</span></button>;})}</div>
   </section>;
  })}</div>
  <button className="free-banner" onClick={onFree}><span className="free-symbol" aria-hidden="true">♫</span><span><strong>자유 눈길</strong><small>정답 없이, 나만의 걸음으로.</small></span><span aria-hidden="true">→</span></button>
  <footer className="home-footer">음표 위의 표지판이, 눈 위의 음악이 돼요.<span>눈길 발자국 · 아티큘레이션 놀이터</span></footer>
 </div>;
}

function Tray({tool,onTool,kinds,read=false,disabled=false}:{tool:Tool;onTool:(tool:Tool)=>void;kinds:Kind[];read?:boolean;disabled?:boolean}){return <div className={`tray ${read?'word-tray':''}`} aria-label={read?'걸음 카드':'표지판'}>{([...KINDS,'clear'] as const).map(k=>{
 const open=k==='clear'||kinds.includes(k);const info=k==='clear'?null:KIND_INFO[k];
 return <button type="button" key={k} className={`tool ${tool===k?'selected':''}`} aria-pressed={tool===k} aria-disabled={!open||disabled} onClick={()=>!disabled&&open&&onTool(k)}>{k==='clear'?<><span className="tool-glyph">×</span><span>{L.clear}</span></>:read?<><span className="tool-word">{info!.word}</span><small>{info!.meaning}</small></>:<><span className="tool-glyph" aria-hidden="true">{info!.glyph}</span><span>{info!.name}</span><small>{info!.word}</small></>}</button>;
 })}</div>;}

function useEditing(initial:Spec,stop:()=>void,read=false){
 const [player,setPlayer]=useState<Spec>(initial),[tool,setTool]=useState<Tool>(null),[guide,setGuide]=useState(read?'아래에서 걸음을 고른 다음, 그렇게 걸을 음을 누르세요.':'아래에서 표지판을 고른 다음, 붙일 음을 누르세요.');
 const select=(k:Tool)=>{stop();setTool(k);if(k==='clear'){setPlayer({...player,marks:['none','none','none','none'],links:[false,false,false]});setGuide(read?'걸음을 모두 뗐어요.':'표지판을 모두 뗐어요.');}else if(k)setGuide(selectedText(k,read?'read':'free'));};
 const edit=(i:number,link:boolean)=>{stop();if(!tool||tool==='clear'){setGuide(read?'먼저 아래에서 걸음을 고르세요.':'먼저 아래에서 표지판을 고르세요.');return;}const r=link?toggleLink(player,i):applyMark(player,i,tool==='leg'?'none':tool);setPlayer(r.spec);if(r.notice)setGuide(noticeText(r.notice));};
 return {player,setPlayer,tool,setTool,guide,setGuide,select,onNote:(i:number)=>edit(i,false),onLink:(i:number)=>edit(i,true)};
}

function FreePlay({sound,notice}:{sound:boolean;notice:(text:string)=>void}){
 const ref=useRef<StageHandle>(null);const [melody,setMelody]=useState(0),[playing,setPlaying]=useState(false);const {progress,classOpen}=useGame();const edit=useEditing(specOf([],0),()=>ref.current?.stop());
 return <section className="play-layout"><div className="play-instruction"><span className="eyebrow">나만의 작은 음악</span><h2>마음 가는 대로 걸어 봐요.</h2><label className="melody-select">{L.melody}<select value={melody} onChange={e=>{ref.current?.stop();const m=Number(e.target.value);setMelody(m);edit.setPlayer(specOf([],m));}}>{Array.from({length:12},(_,i)=><option key={i} value={i}>가락 {i+1}</option>)}</select></label></div>
 <div className="stage-panel"><Stage ref={ref} spec={edit.player} showLinks={edit.tool==='leg'} interactive={edit.tool==='leg'?'links':'notes'} onNote={edit.onNote} onLink={edit.onLink} soundOn={sound} onPlaying={setPlaying} onAudioFailure={()=>notice('이 화면에서는 소리를 낼 수 없어요. 걸음과 자국으로 확인해 주세요.')}/></div>
 <div className="play-controls"><p className="guide" aria-live="polite">{edit.guide}</p><Tray tool={edit.tool} onTool={edit.select} kinds={openKinds(progress,classOpen)}/><button className="button full" onClick={()=>playing?ref.current?.stop():void ref.current?.walk(edit.player)}>{playing?L.stop:L.walk}<span aria-hidden="true">{playing?'■':'▶'}</span></button><p className="small muted centered">별과 정답 없이 마음껏 견주어 보세요.</p></div></section>;
}

function Intro({stage,sound,onFinish,notice}:{stage:number;sound:boolean;onFinish:()=>void;notice:(text:string)=>void}){
 const ref=useRef<StageHandle>(null);const [index,setIndex]=useState(0),[ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[compared,setCompared]=useState<string[]>([]);const pendingCompare=useRef<string|null>(null);const {completeIntro}=useGame();
 const scenes=INTRO_SCENES[stage],scene=scenes[index];const kind=STAGES[stage-1].kind;const edit=useEditing(specOf(scene.pattern??[],0),()=>ref.current?.stop());
 const next=()=>{ref.current?.stop();if(index===scenes.length-1){completeIntro(stage);onFinish();return;}const n=scenes[index+1];setIndex(index+1);setReady(n.type==='table'||n.type==='end');if(n.type!=='end')edit.setPlayer(specOf(n.pattern??[],0));edit.setTool(null);pendingCompare.current=null;};
 const canWalk=scene.type!=='place'||(kind&&symbolKinds(edit.player).includes(kind));
 const complete=()=>{setPlaying(false);if(scene.type==='compare'&&pendingCompare.current){const all=[...new Set([...compared,pendingCompare.current])];setCompared(all);setReady(all.length===3);}else setReady(true);};
 return <section className="play-layout intro-layout"><div className="play-instruction"><div className="step-label">{stageName(stage)} · {index+1}/{scenes.length}</div><h2>{scene.text}</h2></div>
 <div className="stage-panel">{scene.type==='table'?<div className="lesson-table"><h3>표지판은 두 가지를 알려 줘요</h3><div><strong>얼마나 길게, 이어서?</strong><span>톡 · 꾹 · 스르륵</span><p>스타카토 · 테누토 · 레가토</p></div><div><strong>얼마나 세게?</strong><span>쿵 · 쾅</span><p>악센트 · 마르카토</p></div></div>:<Stage ref={ref} spec={edit.player} interactive={scene.type==='place'?(edit.tool==='leg'?'links':'notes'):false} showLinks={scene.type==='place'&&edit.tool==='leg'} onNote={(i)=>{setReady(false);edit.onNote(i);}} onLink={(i)=>{setReady(false);edit.onLink(i);}} soundOn={sound} onPlaying={setPlaying} onDone={complete} onAudioFailure={()=>notice('이 화면에서는 소리를 낼 수 없어요. 걸음과 자국으로 확인해 주세요.')}/>}</div>
 <div className="play-controls"><p className="guide" aria-live="polite">{scene.type==='place'?edit.guide:scene.type==='compare'?`${compared.length}/3 걸음을 견주었어요.`:ready?'잘 보았어요. 다음으로 가 볼까요?':'걷기를 눌러 걸음과 자국을 살펴보세요.'}</p>
 {scene.type==='place'&&<Tray tool={edit.tool} onTool={(k)=>{setReady(false);edit.select(k);}} kinds={kind?[kind]:[]}/>}
 {scene.type==='compare'&&<div className="compare-buttons">{(['none','ten','leg'] as const).map(k=><button className="button secondary" key={k} aria-pressed={compared.includes(k)} onClick={()=>{ref.current?.stop();pendingCompare.current=k;const s=specOf(k==='none'?[]:[{kind:k,scope:'ALL'}],0);edit.setPlayer(s);void ref.current?.walk(s);}}>{k==='none'?'보통 걸음':KIND_INFO[k].name}{compared.includes(k)?' ✓':''}</button>)}</div>}
 <div className="actions">{scene.type!=='table'&&scene.type!=='end'&&scene.type!=='compare'&&<button className="button secondary" disabled={!canWalk||playing} onClick={()=>void ref.current?.walk(edit.player)}>{playing?'걷는 중…':L.walk} ▶</button>}<button className="button" disabled={(!ready&&scene.type!=='table'&&scene.type!=='end')||playing} onClick={next}>{scene.type==='end'?L.finish:L.next} →</button></div></div></section>;
}

function Mission({id,seed,sound,notice,onHome,onRetry,onNext}:{id:string;seed:number;sound:boolean;notice:(text:string)=>void;onHome:()=>void;onRetry:()=>void;onNext:(id:string)=>void}){
 const [base]=useState(()=>makeMission(id,seed));const [problems,setProblems]=useState(base);const [index,setIndex]=useState(0),[firstTry,setFirstTry]=useState<boolean[]>([]),[retryStarted,setRetryStarted]=useState(false),[retryPrompt,setRetryPrompt]=useState(false),[result,setResult]=useState(false),[playing,setPlaying]=useState(false),[attempts,setAttempts]=useState(0),[solved,setSolved]=useState(false),[first,setFirst]=useState(false),[checks,setChecks]=useState<boolean[]|undefined>(),[guide,setGuide]=useState(''),[wrongChoices,setWrongChoices]=useState<string[]>([]),[hasWalked,setHasWalked]=useState(false),[hasEdited,setHasEdited]=useState(false);
 const firstAnswer=useRef<boolean|null>(null);const ref=useRef<StageHandle>(null);const pending=useRef<{diffs:Diff[];first:boolean;level:number}|null>(null);const {progress,classOpen,completeMission}=useGame();const p=problems[index];
 const edit=useEditing(specOf([],p?.melody??0),()=>ref.current?.stop(),p?.play==='read');const stage=Number(id[0]);const available=openKinds(emptyProgress(),stage);
 const finish=useCallback(()=>{if(!pending.current)return;const answer=pending.current;pending.current=null;setHasWalked(true);setChecks([0,1,2,3].map(i=>!answer.diffs.some(d=>d.i===i)));if(answer.diffs.length===0){setSolved(true);setFirst(answer.first);setGuide(correctText(p.target));}else setGuide(hintText(answer.diffs,answer.level,p.play));},[p]);
 const run=()=>{if(playing){ref.current?.stop();return;}if(p.play==='ear'&&!getSound()){setGuide('소리를 켜야 할 수 있어요.');return;}
  if(p.form==='choose'||solved){pending.current=null;void ref.current?.walk(p.form==='choose'?p.target:edit.player);return;}
  const diffs=judge(edit.player,p.target);if(firstAnswer.current===null)firstAnswer.current=diffs.length===0;pending.current={diffs,first:firstAnswer.current,level:attempts+1};setChecks(undefined);setAttempts(n=>n+1);setGuide('걸어 볼게요.');void ref.current?.walk(edit.player);
 };
 const reset=(next:Problem)=>{ref.current?.stop();firstAnswer.current=null;pending.current=null;setAttempts(0);setSolved(false);setFirst(false);setChecks(undefined);setGuide('');setWrongChoices([]);setHasWalked(false);setHasEdited(false);edit.setPlayer(specOf([],next.melody));edit.setTool(null);edit.setGuide(next.play==='read'?'아래에서 걸음을 고른 다음, 그렇게 걸을 음을 누르세요.':'아래에서 표지판을 고른 다음, 붙일 음을 누르세요.');};
 const next=()=>{const values=index<base.length?[...firstTry,first]:firstTry;if(index<base.length)setFirstTry(values);
  if(index+1<problems.length){reset(problems[index+1]);setIndex(index+1);return;}
  if(!retryStarted){const retries=makeRetry(id,base,values,seed);setRetryStarted(true);if(retries.length){setProblems([...base,...retries]);setRetryPrompt(true);return;}}
  completeMission(id,base,values);setResult(true);
 };
 const choose=(choice:Kind|'none')=>{if(solved||playing||wrongChoices.includes(choice)||p.play==='ear'&&!sound)return;const feedback=chooseFeedback(p.play,p.target,choice,attempts+1);setAttempts(n=>n+1);setGuide(feedback.text);if(!feedback.correct)setWrongChoices(a=>[...a,choice]);if(feedback.correct||feedback.revealed){setSolved(true);setFirst(attempts===0&&feedback.correct);pending.current=null;void ref.current?.walk(p.target);}};
 useEffect(()=>{if(p?.play!=='ear'||solved||!sound||result)return;const timer=setTimeout(()=>{void ref.current?.walk(p.target);},400);return()=>clearTimeout(timer);},[p,solved,sound,result]);
 useEffect(()=>{if(!sound&&p?.play==='ear'){ref.current?.stop();setGuide('소리를 켜야 할 수 있어요.');}},[sound,p?.play]);
 if(result){const stars=starsOf({firstTry});const nextId=MISSIONS[MISSIONS.indexOf(id)+1];return <section className="result panel"><TrailArt stage={stage}/><span className="eyebrow">{stageName(stage)} · {missionName(id)}</span><h2>{stars===3?'모두 한 번에 걸었어요!':stars===2?'거의 한 번에 걸었어요.':'끝까지 걸었어요.'}</h2><div className="big-stars" aria-label={`별 ${stars}개`}>{'★'.repeat(stars)}<span>{'☆'.repeat(3-stars)}</span></div><p>{base.length}문제 가운데 {firstTry.filter(Boolean).length}문제를 한 번에 맞혔어요.</p><div className="result-actions">{nextId&&isOpen(progress,nextId,classOpen,sound)&&<button className="button" onClick={()=>onNext(nextId)}>{L.nextMission} →</button>}<button className="button secondary" onClick={onRetry}>{L.retry}</button><button className="text-button" onClick={onHome}>{L.map}</button></div></section>;}
 if(retryPrompt)return <section className="result panel"><TrailArt stage={stage}/><h2>헷갈린 걸음을 한 번 더 걸어 볼까요?</h2><p>다시 풀기는 별 계산에 넣지 않아요.</p><button className="button" onClick={()=>{reset(problems[base.length]);setIndex(base.length);setRetryPrompt(false);}}>다시 걷기 →</button></section>;
 const place=p.form==='place',read=p.play==='read',det=p.play==='det',ear=p.play==='ear';const displaySpec=read?p.target:place?edit.player:p.target;
 const instruction=p.play==='make'?orderText(p.pattern??[],p.orderStyle??'mean'):read?'악보를 보고 펭귄에게 걸음을 알려 주세요.':ear?'눈보라로 눈길이 안 보여요. 소리를 듣고 골라 보세요.':place?'누가 지나갔을까요? 자국을 보고 표지판을 세워 보세요.':'자국을 보고 어떤 표지판이 있었는지 골라 보세요.';
 const editAction=(action:()=>void)=>{pending.current=null;setChecks(undefined);setGuide('');setHasWalked(false);setHasEdited(true);action();};
 return <section className={`play-layout mission-layout ${place?'':'choice-layout'}`}>
  <div className="play-instruction"><div className="problem-progress"><span>{index<base.length?`${index+1} / ${base.length}`:`다시 풀기 ${index-base.length+1} / ${problems.length-base.length}`}</span><div aria-label={`문제 ${index+1}`} className="progress-dots">{problems.map((_,i)=><span key={i} className={i===index?'now':i<index?'done':''}>{i>=base.length?'◇':'●'}</span>)}</div></div><h2>{instruction}</h2></div>
  <div className="stage-panel"><Stage ref={ref} spec={displaySpec} target={det&&!solved?p.target:undefined} targetOutline={hasWalked} ghost={attempts>=3&&checks?.some(ok=>!ok)&&!solved&&place&&!read?p.target:undefined} prints={!place||hasWalked||solved} hideMarks={!read&&!solved&&(p.form==='choose'||det&&!hasEdited)} storm={ear&&!solved} showLinks={place&&edit.tool==='leg'&&!solved} interactive={place&&!solved?(edit.tool==='leg'?'links':'notes'):false} onNote={(i)=>editAction(()=>edit.onNote(i))} onLink={(i)=>editAction(()=>edit.onLink(i))} checks={checks} readCards={read?readCards(edit.player):undefined} readLinks={read?edit.player.links:undefined} ghostReadCards={read&&attempts>=3&&checks?.some(ok=>!ok)&&!solved?readCards(p.target):undefined} ghostReadLinks={read&&attempts>=3&&checks?.some(ok=>!ok)&&!solved?p.target.links:undefined} soundOn={sound} onDone={finish} onPlaying={setPlaying} onAudioFailure={()=>{notice('이 화면에서는 소리를 낼 수 없어요. 걸음과 자국으로 확인해 주세요.');if(ear)onHome();}}/></div>
  <div className="play-controls"><p className={`guide ${solved?'success':''}`} aria-live="polite">{ear&&!sound?'소리를 켜야 할 수 있어요.':guide||edit.guide}</p>
   {place?<Tray tool={edit.tool} onTool={(k)=>editAction(()=>edit.select(k))} kinds={available} read={read} disabled={solved}/>:<div className="choice-grid">{p.choices?.map(k=><button className={`choice ${wrongChoices.includes(k)?'wrong-choice':''}`} key={k} disabled={playing||solved||wrongChoices.includes(k)||ear&&!sound} onClick={()=>choose(k)}><span className="choice-glyph">{k==='none'?'—':KIND_INFO[k].glyph}</span><span>{k==='none'?L.noSign:KIND_INFO[k].name}</span></button>)}</div>}
   <div className="actions">{solved?<><button className="button" disabled={playing} onClick={next}>{L.next} →</button><button className="button secondary" onClick={run}>{playing?L.stop:ear?L.listen:L.replay}</button></>:place?<button className="button full" onClick={run}>{playing?L.stop:L.tryWalk} <span aria-hidden="true">{playing?'■':'▶'}</span></button>:ear?<button className="button full secondary" disabled={!sound} onClick={run}>{playing?L.stop:L.listen} ♪</button>:null}</div>
  </div>
 </section>;
}
