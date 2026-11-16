import { describe, expect, it } from 'vitest';
import { applyMark, applyResult, audioPlan, BEAT, chooseFeedback, completeIntro, emptyProgress, emptySpec, GEOM, hintText, INTRO, isOpen, isValid, judge, KINDS, kindsOf, makeMission, makeRetry, MELODIES, MISSIONS, onoOf, openKinds, orderText, patterns, plan, poseAt, printShapes, readCards, SCOPES, specOf, starsOf, toggleLink, type Mark, type Spec } from './engine';

const all=(kind:'stac'|'ten'|'leg'|'acc'|'marc')=>specOf([{kind,scope:'ALL'}]);
describe('source plan R-01 through R-18',()=>{
  it('contains 12 four-note melodies without repeated neighboring pitches',()=>{
    expect(MELODIES).toHaveLength(12);
    for(const melody of MELODIES){expect(melody).toHaveLength(4);for(let i=1;i<4;i++)expect(melody[i]).not.toBe(melody[i-1]);}
  });
  it('enumerates exactly 1732 valid combinations independently of the engine planner',()=>{
    const marks:Mark[]=['none','stac','ten','acc','marc'];let count=0;
    for(let raw=0;raw<625;raw++)for(let mask=0;mask<8;mask++){
      let n=raw;const values:Mark[]=[];for(let i=0;i<4;i++){values.push(marks[n%5]);n=Math.floor(n/5);}
      const s:Spec={pitches:[...MELODIES[0]],marks:values,links:[0,1,2].map(i=>!!(mask&(1<<i)))};
      const expected=s.links.every((v,i)=>!v||[i,i+1].every(j=>values[j]!=='stac'&&values[j]!=='ten'));
      expect(isValid(s)).toBe(expected);if(!expected)continue;count++;
      const notes=plan(s);expect(notes).toHaveLength(4);
      for(let i=0;i<4;i++){
        expect(notes[i].len).toBe(s.links[i]?1:values[i]==='stac'?.3:values[i]==='ten'?.92:.65);
        expect(notes[i].str).toBe(values[i]==='acc'?1:values[i]==='marc'?2:0);
      }
      expect(judge(s,s)).toEqual([]);
      const voices=audioPlan(notes);expect(voices).toHaveLength(4-s.links.filter(Boolean).length);
      expect(voices.flatMap(v=>v.notes)).toHaveLength(4);
    }
    expect(count).toBe(1732);
  });
  it('keeps inputs immutable and resolves staccato/tenuto versus legato conflicts',()=>{
    const s=all('leg'),snapshot=JSON.stringify(s);const marked=applyMark(s,1,'stac');
    expect(marked.notice).toBe('T-23');expect(marked.spec.links).toEqual([false,false,true]);
    expect(JSON.stringify(s)).toBe(snapshot);expect(isValid(marked.spec)).toBe(true);
    const linked=toggleLink(marked.spec,1);expect(linked.notice).toBe('T-24');expect(linked.spec.marks[1]).toBe('none');
    expect(applyMark(marked.spec,1,'stac').spec.marks[1]).toBe('none');
    expect(applyMark(s,1,'acc').spec.links).toEqual([true,true,true]);
  });
  it('uses normal, staccato, tenuto, legato lengths and independent strengths',()=>{
    expect(plan(emptySpec()).map(n=>n.len)).toEqual([.65,.65,.65,.65]);
    expect(plan(all('stac')).map(n=>n.len)).toEqual([.3,.3,.3,.3]);
    expect(plan(all('ten')).map(n=>n.len)).toEqual([.92,.92,.92,.92]);
    expect(plan(all('leg')).map(n=>n.len)).toEqual([1,1,1,.65]);
    expect(plan(all('acc')).map(n=>[n.len,n.str])).toEqual(Array.from({length:4},()=>[.65,1]));
    expect(plan(all('marc')).map(n=>[n.len,n.str])).toEqual(Array.from({length:4},()=>[.65,2]));
  });
  it('makes continuous legato bars, shorter staccato dots and stress wedges',()=>{
    const joined=printShapes(plan(all('leg')));expect(joined).toEqual([{k:'bar',x0:98,x1:98+3.65*58,th:10}]);
    const staccato=printShapes(plan(all('stac')));expect(staccato).toHaveLength(4);expect(staccato[0]).toEqual({k:'bar',x0:98,x1:98+.3*58,th:12});
    expect(printShapes(plan(all('acc'))).filter(s=>s.k==='wedge').map(s=>s.h)).toEqual([11,11,11,11]);
    expect(printShapes(plan(all('marc'))).filter(s=>s.k==='specks')).toHaveLength(4);
  });
});
describe('deterministic question generation and learning semantics',()=>{
  it('transcribes all 113 unique Appendix A patterns with stage counts 12/16/21/21/27/70',()=>{
    expect([1,2,3,4,5,6].map(k=>patterns(k).length)).toEqual([12,16,21,21,27,70]);
    const global=new Set<string>();
    for(let stage=1;stage<=6;stage++){
      const targets=new Set<string>();
      for(const p of patterns(stage)){
        const ids=p.flatMap(c=>SCOPES[c.scope]);expect(new Set(ids).size).toBe(ids.length);
        expect(isValid(specOf(p))).toBe(true);const key=JSON.stringify(specOf(p));expect(targets.has(key)).toBe(false);targets.add(key);global.add(key);
        if(p.some(c=>c.kind==='leg'))expect(p.filter(c=>c.kind==='leg').every(c=>SCOPES[c.scope].length>=2)).toBe(true);
      }
    }
    expect(global.size).toBe(113);
  });
  it('has one unique answer per order sentence for every stage and both styles',()=>{
    for(let stage=1;stage<=6;stage++)for(const style of ['mean','name'] as const){
      const textToAnswer=new Map<string,string>();
      for(const p of patterns(stage)){
        const text=orderText(p,style),answer=JSON.stringify(specOf(p));
        if(textToAnswer.has(text))expect(textToAnswer.get(text)).toBe(answer);textToAnswer.set(text,answer);
      }
    }
    expect(orderText([{kind:'stac',scope:'ALL'}],'name')).toBe('네 음 모두 스타카토로 건너 줘.');
    expect(orderText([{kind:'marc',scope:'N4'},{kind:'leg',scope:'F2'}])).toBe('앞의 두 음은 끊지 말고 이어서, 넷째 음은 가장 세게, 나머지는 보통 걸음으로 건너 줘.');
  });
  it('generates 99 required questions plus 6 optional, with correct choices and quotas across 100 seeds',()=>{
    const ids=MISSIONS.filter(id=>!id.endsWith('-0'));
    expect(ids).toHaveLength(19);expect(ids.filter(id=>id!=='6-4').reduce((sum,id)=>sum+makeMission(id,1).length,0)).toBe(99);
    for(let seed=0;seed<100;seed++)for(const id of ids){
      const [stage,mission]=id.split('-').map(Number),problems=makeMission(id,seed);
      expect(problems).toEqual(makeMission(id,seed));expect(problems).toHaveLength(mission===4?6:stage===6?8:5);
      expect(new Set(problems.map(p=>p.melody)).size).toBe(problems.length);
      expect(new Set(problems.map(p=>JSON.stringify({m:p.target.marks,l:p.target.links}))).size).toBe(problems.length);
      for(const p of problems){expect(isValid(p.target)).toBe(true);expect(p.target).toEqual(specOf(p.pattern,p.melody));}
      if(stage===6)expect(new Set(problems.flatMap(p=>kindsOf(p.target))).size).toBe(5);
      if(mission===1){expect(problems.filter(p=>p.orderStyle==='mean')).toHaveLength(stage===6?4:3);}
      const place=problems.filter(p=>p.form==='place'),choose=problems.filter(p=>p.form==='choose');
      if(mission===3&&stage>=3)expect(choose).toHaveLength(stage===6?3:2);else if(mission!==4)expect(choose).toHaveLength(0);
      const sizes=place.map(p=>p.pattern!.length);
      if(stage===1){expect(place[0].pattern).toEqual([{kind:'stac',scope:'ALL'}]);expect(place.some(p=>SCOPES[p.pattern![0].scope].length===1)).toBe(true);expect(place.some(p=>SCOPES[p.pattern![0].scope].length===2)).toBe(true);}
      if(stage===2){expect(sizes.filter(n=>n===1)).toHaveLength(2);expect(sizes.filter(n=>n===2)).toHaveLength(3);expect(place.some(p=>JSON.stringify(p.pattern)===JSON.stringify([{kind:'leg',scope:'ALL'}]))).toBe(true);}
      if(stage===3||stage===4){expect(sizes.filter(n=>n===1)).toHaveLength(mission===3?0:2);expect(sizes.filter(n=>n===2)).toHaveLength(3);}
      if(stage===5){expect(sizes.filter(n=>n===1)).toHaveLength(mission===3?0:1);expect(place.filter(p=>p.pattern!.length===2&&p.pattern!.some(c=>c.kind==='acc'))).toHaveLength(2);}
      if(stage===6&&mission!==4){expect(sizes.filter(n=>n===2)).toHaveLength(mission===3?2:4);expect(sizes.filter(n=>n===3)).toHaveLength(mission===3?3:4);}
    }
  });
  it('gives focused staged hints and preserves two-axis judgment',()=>{
    const diff=judge(emptySpec(),specOf([{kind:'marc',scope:'N3'}]));expect(diff).toEqual([{i:2,len:null,str:2}]);
    expect(hintText(diff,1,'make')).toBe('셋째 음의 세기가 주문과 달라요.');
    expect(hintText(diff,2,'read')).toContain('가장 세게 딛는 걸음(쾅)');expect(hintText(diff,3,'det')).toContain('정답을 흐리게');
    expect(chooseFeedback('det',all('marc'),'acc',1)).toMatchObject({correct:false,revealed:false});
    expect(chooseFeedback('det',all('marc'),'stac',2)).toMatchObject({correct:false,revealed:true});
    expect(chooseFeedback('ear',all('ten'),'ten',0)).toMatchObject({correct:true,revealed:false});
  });
  it('retries at most two missed types with different templates and excludes them from stars',()=>{
    const base=makeMission('4-1',42),flags=base.map(()=>false),retry=makeRetry('4-1',base,flags,91);
    expect(retry).toHaveLength(2);
    for(const q of retry){expect(base.some(p=>JSON.stringify(p.pattern)===JSON.stringify(q.pattern))).toBe(false);expect(isValid(q.target)).toBe(true);}
    expect(retry.map(p=>p.family)).toEqual(base.slice(0,2).map(p=>p.family));
    expect(starsOf({firstTry:[true,true,true,false,false]})).toBe(1);expect(starsOf({firstTry:[true,true,true,true,false]})).toBe(2);expect(starsOf({firstTry:Array(8).fill(true)})).toBe(3);
    expect(starsOf({firstTry:[true,true,true,true,true,true,false,false]})).toBe(2);
    const choices=makeMission('6-4',19),choiceRetry=makeRetry('6-4',choices,Array(6).fill(false),3);
    expect(choiceRetry).toHaveLength(2);expect(choiceRetry[0].pattern).toEqual(choices[0].pattern);expect(choiceRetry[0].melody).not.toBe(choices[0].melody);
  });
});
describe('progress and independent audio/animation schedules',()=>{
  it('opens missions sequentially and keeps lesson-link overrides temporary',()=>{
    let progress=emptyProgress();expect(isOpen(progress,'1-0')).toBe(true);expect(isOpen(progress,'1-1')).toBe(false);expect(isOpen(progress,'2-0')).toBe(false);
    expect(isOpen(progress,'3-3',3,false)).toBe(true);expect(progress).toEqual(emptyProgress());
    progress=completeIntro(progress,1);expect(isOpen(progress,'1-1')).toBe(true);expect(isOpen(progress,'1-2')).toBe(false);
    for(let mission=1;mission<=3;mission++){const id='1-'+mission,qs=makeMission(id,19);progress=applyResult(progress,id,qs,{firstTry:qs.map(()=>true)});}
    expect(isOpen(progress,'2-0')).toBe(true);expect(isOpen(progress,'2-1')).toBe(false);expect(openKinds(progress)).toEqual(['stac','leg']);
    expect(isOpen(progress,'6-4',6,false)).toBe(false);expect(isOpen(progress,'6-4',6,true)).toBe(true);
  });
  it('records only base problem symbol statistics and preserves best stars',()=>{
    const qs=makeMission('6-1',95),flags=qs.map(()=>true),first=applyResult(emptyProgress(),'6-1',qs,{firstTry:flags});
    const later=applyResult(first,'6-1',qs,{firstTry:flags.map(()=>false)});expect(later.stars['6-1']).toBe(3);
    for(const k of KINDS){expect(first.stats[k].seen).toBe(qs.filter(p=>kindsOf(p.target).includes(k)).length);expect(first.stats[k].first).toBe(first.stats[k].seen);expect(later.stats[k].seen).toBe(first.stats[k].seen*2);}
    expect(emptyProgress().stats.stac.seen).toBe(0);
  });
  it('groups legato voices and uses correct note-end durations without changing beat timing',()=>{
    for(const [kind,length] of [['stac',.3],['ten',.92],['acc',.65]] as const){const voices=audioPlan(plan(all(kind)));expect(voices).toHaveLength(4);expect(voices[3].end).toBeCloseTo((3+length)*BEAT);expect(voices[0].notes[0].attack).toBe(true);}
    const voices=audioPlan(plan(all('leg')));expect(voices).toHaveLength(1);expect(voices[0].end).toBeCloseTo(3.65*BEAT);expect(voices[0].notes.map(n=>n.attack)).toEqual([true,false,false,false]);
    expect(voices[0].notes.map(n=>n.time)).toEqual([0,BEAT,2*BEAT,3*BEAT]);
  });
  it('uses one consistent animation timeline and gives distinct jumps and stress words',()=>{
    expect(poseAt(plan(emptySpec()),-.5)).toMatchObject({x:56,lift:0});expect(poseAt(plan(emptySpec()),0).x).toBe(98);expect(poseAt(plan(emptySpec()),4*BEAT).x).toBe(GEOM.X0+4*GEOM.W);
    expect(poseAt(plan(all('leg')),.2).slide).toBe(1);expect(poseAt(plan(all('stac')),.65*BEAT).lift).toBeCloseTo(19.6);
    expect(onoOf(plan(all('marc'))[0])).toEqual({text:'쾅',size:2});expect(onoOf(plan(all('leg'))[1])).toBeNull();
    expect(readCards(all('leg'))).toEqual(['스르륵','스르륵','스르륵','스르륵']);
    expect(Object.keys(INTRO)).toHaveLength(6);
  });
});
